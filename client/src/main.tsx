import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import theme from "./chakra/theme.ts";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 30 * 1000, // 30 seconds
			gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
			retry: (failureCount, error) => {
				// Don't retry for client errors (4xx)
				if (error?.message?.includes('4')) return false;
				return failureCount < 3;
			},
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: (failureCount, error) => {
				// Don't retry for client errors (4xx)  
				if (error?.message?.includes('4')) return false;
				return failureCount < 2;
			},
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<ChakraProvider theme={theme}>
				<App />
			</ChakraProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
