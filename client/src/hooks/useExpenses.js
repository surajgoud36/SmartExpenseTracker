import {useQuery, useMutation, useQueryClient} from "@tanstack/react-query";
import {api} from "../api/client.js";

export const useSummary = () => {
    return useQuery({
        queryKey: ["summary"],
        queryFn: async () => (await api.get("/expenses/summary")).data,
    });
};

export const useExpenses = (limit = 10) => {
    return useQuery({
        queryKey: ["expenses",limit],
        queryFn: async () => (await api.get(`/expenses?limit=${limit}`)).data,
    });
};

export const useCreateExpense = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload) => api.post("/expenses",payload),
        onSuccess: () => {
            qc.invalidateQueries({queryKey: ["summary"]});
            qc.invalidateQueries({queryKey:["expenses"]});
        },
    });
};

export const useDeleteExpense = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => api.delete(`/expenses/${id}`),
        onSuccess: () =>{
            qc.invalidateQueries({queryKey: ["summary"]});
            qc.invalidateQueries({queryKey:["expenses"]});
        },
    });
};