import { Badge, Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { FaCheckCircle } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Todo } from "./TodoList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../App";

const TodoItem = ({ todo }: { todo: Todo }) => {
	const queryClient = useQueryClient();

	const { mutate: updateTodo, isPending: isUpdating } = useMutation({
		mutationKey: ["updateTodo", todo._id],
		mutationFn: async (): Promise<Todo> => {
			if (todo.complete) return Promise.reject(new Error("Todo is already completed"));
			
			const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
				method: "PATCH",
			});
			
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}
			
			return await res.json();
		},
		onMutate: async () => {
			// Cancel outgoing refetches (so they don't overwrite our optimistic update)
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			// Snapshot the previous value
			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

			// Optimistically update to the new value
			if (previousTodos) {
				queryClient.setQueryData<Todo[]>(["todos"], (old) =>
					old?.map((t) =>
						t._id === todo._id ? { ...t, complete: !t.complete } : t
					) || []
				);
			}

			// Return context with the previous and new todo
			return { previousTodos, optimisticTodo: { ...todo, complete: !todo.complete } };
		},
		onError: (err, _variables, context) => {
			// If the mutation fails, use the context we returned above
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
			console.error("Failed to update todo:", err);
			alert(err.message || "Failed to update todo");
		},
		onSuccess: (updatedTodo) => {
			// Update the cache with the server response
			queryClient.setQueryData<Todo[]>(["todos"], (old) =>
				old?.map((t) => (t._id === updatedTodo._id ? updatedTodo : t)) || []
			);
		},
		onSettled: () => {
			// Always refetch after error or success to ensure cache is in sync
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	const { mutate: deleteTodo, isPending: isDeleting } = useMutation({
		mutationKey: ["deleteTodo", todo._id],
		mutationFn: async () => {
			const res = await fetch(BASE_URL + `/todos/${todo._id}`, {
				method: "DELETE",
			});
			
			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Something went wrong");
			}
			
			return await res.json();
		},
		onMutate: async () => {
			// Cancel outgoing refetches
			await queryClient.cancelQueries({ queryKey: ["todos"] });

			// Snapshot the previous value
			const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]);

			// Optimistically remove the todo
			if (previousTodos) {
				queryClient.setQueryData<Todo[]>(["todos"], (old) =>
					old?.filter((t) => t._id !== todo._id) || []
				);
			}

			return { previousTodos };
		},
		onError: (err, _variables, context) => {
			// Rollback on error
			if (context?.previousTodos) {
				queryClient.setQueryData(["todos"], context.previousTodos);
			}
			console.error("Failed to delete todo:", err);
			alert(err.message || "Failed to delete todo");
		},
		onSettled: () => {
			// Refetch to ensure cache is in sync
			queryClient.invalidateQueries({ queryKey: ["todos"] });
		},
	});

	return (
		<Flex gap={2} alignItems={"center"} data-testid={`todo-item-${todo._id}`}>
			<Flex
				flex={1}
				alignItems={"center"}
				border={"1px"}
				borderColor={"gray.600"}
				p={2}
				borderRadius={"lg"}
				justifyContent={"space-between"}
			>
				<Text
					data-testid={`todo-text-${todo._id}`}
					color={todo.complete ? "green.200" : "yellow.100"}
					textDecoration={todo.complete ? "line-through" : "none"}
				>
					{todo.body}
				</Text>
				{todo.complete && (
					<Badge ml='1' colorScheme='green' data-testid={`todo-badge-${todo._id}`}>
						Done
					</Badge>
				)}
				{!todo.complete && (
					<Badge ml='1' colorScheme='yellow' data-testid={`todo-badge-${todo._id}`}>
						In Progress
					</Badge>
				)}
			</Flex>
			<Flex gap={2} alignItems={"center"}>
				<Box 
					color={todo.complete ? "gray.400" : "green.500"} 
					cursor={todo.complete ? "not-allowed" : "pointer"} 
					onClick={() => !todo.complete && updateTodo()}
				>
					{!isUpdating && <FaCheckCircle size={20} data-testid={`complete-button-${todo._id}`} />}
					{isUpdating && <Spinner size={"sm"} data-testid={`complete-spinner-${todo._id}`} />}
				</Box>
				<Box color={"red.500"} cursor={"pointer"} onClick={() => deleteTodo()}>
					{!isDeleting && <MdDelete size={25} data-testid={`delete-button-${todo._id}`} />}
					{isDeleting && <Spinner size={"sm"} data-testid={`delete-spinner-${todo._id}`} />}
				</Box>
			</Flex>
		</Flex>
	);
};
export default TodoItem;

// STARTER CODE:

// import { Badge, Box, Flex, Text } from "@chakra-ui/react";
// import { FaCheckCircle } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";

// const TodoItem = ({ todo }: { todo: any }) => {
// 	return (
// 		<Flex gap={2} alignItems={"center"}>
// 			<Flex
// 				flex={1}
// 				alignItems={"center"}
// 				border={"1px"}
// 				borderColor={"gray.600"}
// 				p={2}
// 				borderRadius={"lg"}
// 				justifyContent={"space-between"}
// 			>
// 				<Text
// 					color={todo.completed ? "green.200" : "yellow.100"}
// 					textDecoration={todo.completed ? "line-through" : "none"}
// 				>
// 					{todo.body}
// 				</Text>
// 				{todo.completed && (
// 					<Badge ml='1' colorScheme='green'>
// 						Done
// 					</Badge>
// 				)}
// 				{!todo.completed && (
// 					<Badge ml='1' colorScheme='yellow'>
// 						In Progress
// 					</Badge>
// 				)}
// 			</Flex>
// 			<Flex gap={2} alignItems={"center"}>
// 				<Box color={"green.500"} cursor={"pointer"}>
// 					<FaCheckCircle size={20} />
// 				</Box>
// 				<Box color={"red.500"} cursor={"pointer"}>
// 					<MdDelete size={25} />
// 				</Box>
// 			</Flex>
// 		</Flex>
// 	);
// };
// export default TodoItem;
