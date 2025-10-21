export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      avisos: {
        Row: {
          activo: boolean | null
          contenido: string
          created_at: string | null
          created_by: string | null
          edificio_id: string | null
          fecha_expiracion: string | null
          fecha_publicacion: string | null
          id: string
          prioridad: string | null
          titulo: string
        }
        Insert: {
          activo?: boolean | null
          contenido: string
          created_at?: string | null
          created_by?: string | null
          edificio_id?: string | null
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          id?: string
          prioridad?: string | null
          titulo: string
        }
        Update: {
          activo?: boolean | null
          contenido?: string
          created_at?: string | null
          created_by?: string | null
          edificio_id?: string | null
          fecha_expiracion?: string | null
          fecha_publicacion?: string | null
          id?: string
          prioridad?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "edificios"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          created_at: string | null
          edificio_id: string | null
          id: string
          metros_cuadrados: number | null
          numero: string
          piso: number | null
          porcentaje_gastos: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          edificio_id?: string | null
          id?: string
          metros_cuadrados?: number | null
          numero: string
          piso?: number | null
          porcentaje_gastos?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          edificio_id?: string | null
          id?: string
          metros_cuadrados?: number | null
          numero?: string
          piso?: number | null
          porcentaje_gastos?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departamentos_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "edificios"
            referencedColumns: ["id"]
          },
        ]
      }
      edificios: {
        Row: {
          ciudad: string | null
          created_at: string | null
          direccion: string | null
          id: string
          nombre: string
          pais: string | null
          updated_at: string | null
        }
        Insert: {
          ciudad?: string | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre: string
          pais?: string | null
          updated_at?: string | null
        }
        Update: {
          ciudad?: string | null
          created_at?: string | null
          direccion?: string | null
          id?: string
          nombre?: string
          pais?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      espacios_comunes: {
        Row: {
          activo: boolean | null
          capacidad: number | null
          created_at: string | null
          descripcion: string | null
          edificio_id: string | null
          id: string
          nombre: string
          requiere_autorizacion: boolean | null
        }
        Insert: {
          activo?: boolean | null
          capacidad?: number | null
          created_at?: string | null
          descripcion?: string | null
          edificio_id?: string | null
          id?: string
          nombre: string
          requiere_autorizacion?: boolean | null
        }
        Update: {
          activo?: boolean | null
          capacidad?: number | null
          created_at?: string | null
          descripcion?: string | null
          edificio_id?: string | null
          id?: string
          nombre?: string
          requiere_autorizacion?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "espacios_comunes_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "edificios"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_comunes: {
        Row: {
          anio: number
          created_at: string | null
          edificio_id: string | null
          estado: string | null
          fecha_vencimiento: string
          id: string
          mes: number
          monto_total: number
          notas: string | null
          updated_at: string | null
        }
        Insert: {
          anio: number
          created_at?: string | null
          edificio_id?: string | null
          estado?: string | null
          fecha_vencimiento: string
          id?: string
          mes: number
          monto_total?: number
          notas?: string | null
          updated_at?: string | null
        }
        Update: {
          anio?: number
          created_at?: string | null
          edificio_id?: string | null
          estado?: string | null
          fecha_vencimiento?: string
          id?: string
          mes?: number
          monto_total?: number
          notas?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_comunes_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "edificios"
            referencedColumns: ["id"]
          },
        ]
      }
      gastos_departamento: {
        Row: {
          created_at: string | null
          departamento_id: string | null
          estado: string | null
          fecha_pago: string | null
          gasto_comun_id: string | null
          id: string
          monto: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          departamento_id?: string | null
          estado?: string | null
          fecha_pago?: string | null
          gasto_comun_id?: string | null
          id?: string
          monto: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          departamento_id?: string | null
          estado?: string | null
          fecha_pago?: string | null
          gasto_comun_id?: string | null
          id?: string
          monto?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gastos_departamento_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gastos_departamento_gasto_comun_id_fkey"
            columns: ["gasto_comun_id"]
            isOneToOne: false
            referencedRelation: "gastos_comunes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificaciones: {
        Row: {
          created_at: string | null
          id: string
          leida: boolean | null
          mensaje: string
          metadata: Json | null
          tipo: string
          titulo: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje: string
          metadata?: Json | null
          tipo: string
          titulo: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      pagos: {
        Row: {
          comprobante_url: string | null
          created_at: string | null
          estado: string | null
          fecha_pago: string | null
          gasto_departamento_id: string | null
          id: string
          metodo_pago: string | null
          monto: number
          notas: string | null
          referencia_externa: string | null
        }
        Insert: {
          comprobante_url?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_pago?: string | null
          gasto_departamento_id?: string | null
          id?: string
          metodo_pago?: string | null
          monto: number
          notas?: string | null
          referencia_externa?: string | null
        }
        Update: {
          comprobante_url?: string | null
          created_at?: string | null
          estado?: string | null
          fecha_pago?: string | null
          gasto_departamento_id?: string | null
          id?: string
          metodo_pago?: string | null
          monto?: number
          notas?: string | null
          referencia_externa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagos_gasto_departamento_id_fkey"
            columns: ["gasto_departamento_id"]
            isOneToOne: false
            referencedRelation: "gastos_departamento"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas: {
        Row: {
          created_at: string | null
          departamento_id: string | null
          edificio_id: string | null
          espacio_id: string | null
          estado: string | null
          fecha_fin: string
          fecha_inicio: string
          id: string
          notas: string | null
        }
        Insert: {
          created_at?: string | null
          departamento_id?: string | null
          edificio_id?: string | null
          espacio_id?: string | null
          estado?: string | null
          fecha_fin: string
          fecha_inicio: string
          id?: string
          notas?: string | null
        }
        Update: {
          created_at?: string | null
          departamento_id?: string | null
          edificio_id?: string | null
          espacio_id?: string | null
          estado?: string | null
          fecha_fin?: string
          fecha_inicio?: string
          id?: string
          notas?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservas_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "edificios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_espacio_id_fkey"
            columns: ["espacio_id"]
            isOneToOne: false
            referencedRelation: "espacios_comunes"
            referencedColumns: ["id"]
          },
        ]
      }
      residentes: {
        Row: {
          created_at: string | null
          departamento_id: string | null
          email: string | null
          es_propietario: boolean | null
          fecha_ingreso: string | null
          id: string
          nombre: string
          rut: string | null
          telefono: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          departamento_id?: string | null
          email?: string | null
          es_propietario?: boolean | null
          fecha_ingreso?: string | null
          id?: string
          nombre: string
          rut?: string | null
          telefono?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          departamento_id?: string | null
          email?: string | null
          es_propietario?: boolean | null
          fecha_ingreso?: string | null
          id?: string
          nombre?: string
          rut?: string | null
          telefono?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residentes_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          edificio_id: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          edificio_id?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          edificio_id?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_edificio_id_fkey"
            columns: ["edificio_id"]
            isOneToOne: false
            referencedRelation: "edificios"
            referencedColumns: ["id"]
          },
        ]
      }
      visitas: {
        Row: {
          autorizado_por: string | null
          created_at: string | null
          departamento_id: string | null
          fecha_entrada: string | null
          fecha_salida: string | null
          id: string
          nombre_visitante: string
          observaciones: string | null
          patente_vehiculo: string | null
          rut_visitante: string | null
        }
        Insert: {
          autorizado_por?: string | null
          created_at?: string | null
          departamento_id?: string | null
          fecha_entrada?: string | null
          fecha_salida?: string | null
          id?: string
          nombre_visitante: string
          observaciones?: string | null
          patente_vehiculo?: string | null
          rut_visitante?: string | null
        }
        Update: {
          autorizado_por?: string | null
          created_at?: string | null
          departamento_id?: string | null
          fecha_entrada?: string | null
          fecha_salida?: string | null
          id?: string
          nombre_visitante?: string
          observaciones?: string | null
          patente_vehiculo?: string | null
          rut_visitante?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitas_autorizado_por_fkey"
            columns: ["autorizado_por"]
            isOneToOne: false
            referencedRelation: "residentes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitas_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crear_notificacion: {
        Args: {
          p_mensaje: string
          p_metadata?: Json
          p_tipo: string
          p_titulo: string
          p_url?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
