import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@deptocorp/supabase-client";
import toast from "react-hot-toast";

export function usePagos(gastoDepartamentoId?: string) {
  const queryClient = useQueryClient();

  // Listar pagos de un gasto departamento
  const { data: pagos, isLoading } = useQuery({
    queryKey: ["pagos", gastoDepartamentoId],
    queryFn: async () => {
      if (!gastoDepartamentoId) return [];
      const { data, error } = await supabase
        .from("pagos")
        .select("*")
        .eq("gasto_departamento_id", gastoDepartamentoId)
        .order("fecha_pago", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!gastoDepartamentoId,
  });

  // Registrar pago
  const registrarPagoMutation = useMutation({
    mutationFn: async (pago: {
      gasto_departamento_id: string;
      monto: number;
      metodo_pago: string;
      referencia_externa?: string;
      comprobante_url?: string;
      notas?: string;
    }) => {
      // Crear el pago
      const { data: nuevoPago, error: pagoError } = await supabase
        .from("pagos")
        .insert({
          ...pago,
          estado: "confirmado",
          fecha_pago: new Date().toISOString(),
        })
        .select()
        .single();

      if (pagoError) throw pagoError;

      // Actualizar estado del gasto departamento a 'pagado'
      const { error: updateError } = await supabase
        .from("gastos_departamento")
        .update({
          estado: "pagado",
          fecha_pago: new Date().toISOString(),
        })
        .eq("id", pago.gasto_departamento_id);

      if (updateError) throw updateError;

      return nuevoPago;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] });
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Pago registrado exitosamente");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al registrar pago");
    },
  });

  // Eliminar pago y revertir estado
  const eliminarPagoMutation = useMutation({
    mutationFn: async (pagoId: string) => {
      // Obtener el pago para saber qué gasto departamento actualizar
      const { data: pago, error: getPagoError } = await supabase
        .from("pagos")
        .select("gasto_departamento_id")
        .eq("id", pagoId)
        .single();

      if (getPagoError) throw getPagoError;
      if (!pago || !pago.gasto_departamento_id) {
        throw new Error("No se encontró el gasto departamento asociado");
      }

      // Eliminar el pago
      const { error: deleteError } = await supabase
        .from("pagos")
        .delete()
        .eq("id", pagoId);

      if (deleteError) throw deleteError;

      // Revertir estado del gasto departamento a 'pendiente'
      const { error: updateError } = await supabase
        .from("gastos_departamento")
        .update({
          estado: "pendiente",
          fecha_pago: null,
        })
        .eq("id", pago.gasto_departamento_id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pagos"] });
      queryClient.invalidateQueries({ queryKey: ["gastos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Pago eliminado y estado revertido");
    },
    onError: (error: any) => {
      toast.error(error.message || "Error al eliminar pago");
    },
  });

  return {
    pagos: pagos || [],
    isLoading,
    registrarPago: registrarPagoMutation.mutate,
    eliminarPago: eliminarPagoMutation.mutate,
    isRegistrandoPago: registrarPagoMutation.isPending,
    isEliminandoPago: eliminarPagoMutation.isPending,
  };
}
