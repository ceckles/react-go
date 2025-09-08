/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { BASE_URL } from "../App";
import { Todo } from "./TodoList";

const TodoForm = () => {
	const [newTodo, setNewTodo] = useState("");

	const queryClient = useQueryClient();

	const { mutate: createTodo, isPending: isCreating } = useMutation({
		mutationKey: ["createTodo"],
		mutationFn: async (e: React.FormEvent): Promise<Todo> => {
			e.preventDefault();
			
			const res = await fetch(BASE_URL + `/todos`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ body: newTodo }),
			});
			
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}

			return await res.json();
		},
		onMutate: async () => {
			// Don't clear the input until we're sure the request will succeed
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			// Snapshot the previous value  
			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

			// Optimistically add the new todo (with temporary ID)
			const optimisticTodo: Todo = {
				_id: `temp-${Date.now()}`, // Temporary ID
				body: newTodo,
				complete: false,
			};

			if (previousTodos) {
				queryClient.setQueryData<Todo[]>(["todos"], (old) => [
					...(old || []),
					optimisticTodo,
				]);
			}

			return { previousTodos, optimisticTodo };
		},
		onError: (err, _variables, context) => {
			// Rollback on error
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
			console.error("Failed to create todo:", err);
			alert(err.message || "Failed to create todo");
		},
		onSuccess: (createdTodo, _variables, context) => {
			// Replace the optimistic todo with the real one from the server
			queryClient.setQueryData<Todo[]>(["todos"], (old) =>
				old?.map((todo) =>
					todo._id === context?.optimisticTodo._id ? createdTodo : todo
				) || [createdTodo]
			);
			
			// Clear the input only on success
			setNewTodo("");
		},
		onSettled: () => {
			// Always refetch after error or success to ensure cache is in sync
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	return (
		<form onSubmit={createTodo}>
			<Flex gap={2}>
				<Input
					type='text'
					value={newTodo}
					onChange={(e) => setNewTodo(e.target.value)}
					ref={(input) => input && input.focus()}
					disabled={isCreating}
				/>
				<Button
					mx={2}
					type='submit'
					_active={{
						transform: "scale(.97)",
					}}
					disabled={isCreating || !newTodo.trim()}
				>
					{isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
				</Button>
			</Flex>
		</form>
	);
};
export default TodoForm;

// STARTER CODE:

// import { Button, Flex, Input, Spinner } from "@chakra-ui/react";
// import { useState } from "react";
// import { IoMdAdd } from "react-icons/io";

// const TodoForm = () => {
// 	const [newTodo, setNewTodo] = useState("");
// 	const [isPending, setIsPending] = useState(false);

// 	const createTodo = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		alert("Todo added!");
// 	};
// 	return (
// 		<form onSubmit={createTodo}>
// 			<Flex gap={2}>
// 				<Input
// 					type='text'
// 					value={newTodo}
// 					onChange={(e) => setNewTodo(e.target.value)}
// 					ref={(input) => input && input.focus()}
// 				/>
// 				<Button
// 					mx={2}
// 					type='submit'
// 					_active={{
// 						transform: "scale(.97)",
// 					}}
// 				>
// 					{isPending ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
// 				</Button>
// 			</Flex>
// 		</form>
// 	);
// };
// export default TodoForm;
