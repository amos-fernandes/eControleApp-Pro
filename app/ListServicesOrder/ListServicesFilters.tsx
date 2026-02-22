import React, { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native"
import { SelectList } from "react-native-dropdown-select-list"
import DateTimePicker from "@react-native-community/datetimepicker"
import moment from "moment"

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder"

interface ListServicesFiltersProps {
  visible: boolean
  onClose: () => void
}

const ListServicesFilters: React.FC<ListServicesFiltersProps> = ({ visible, onClose }) => {
  const { filters, setFilters, resetFilters } = useFilterServiceOrderStore()
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  const statusOptions = [
    { key: "all", value: "Todas" },
    { key: "checking", value: "Em conferência" },
    { key: "started", value: "Iniciada" },
    { key: "completed", value: "Concluída" },
  ]

  const typeOptions = [
    { key: "all", value: "Todos" },
    { key: "collection", value: "Coleta" },
    { key: "delivery", value: "Entrega" },
  ]

  const voyageOptions = [
    { key: "all", value: "Todas" },
    { key: "assigned", value: "Atribuídas" },
    { key: "unassigned", value: "Não atribuídas" },
  ]

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false)
    if (selectedDate) {
      setFilters({ start_date: moment(selectedDate).format("YYYY-MM-DD") })
    }
  }

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false)
    if (selectedDate) {
      setFilters({ end_date: moment(selectedDate).format("YYYY-MM-DD") })
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#e0e0e0" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 16, color: "#666" }}>✕ Fechar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={{ padding: 20 }}>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: "600" }}>Status:</Text>
              <SelectList
                setSelected={(val: string) => setFilters({ status: val })}
                data={statusOptions}
                save="key"
                placeholder="Selecione o status"
                defaultOption={statusOptions.find(opt => opt.key === filters.status)}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: "600" }}>Tipo:</Text>
              <SelectList
                setSelected={(val: string) => setFilters({ so_type: val })}
                data={typeOptions}
                save="key"
                placeholder="Selecione o tipo"
                defaultOption={typeOptions.find(opt => opt.key === filters.so_type)}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: "600" }}>Viagem:</Text>
              <SelectList
                setSelected={(val: string) => setFilters({ voyage: val })}
                data={voyageOptions}
                save="key"
                placeholder="Selecione a viagem"
                defaultOption={voyageOptions.find(opt => opt.key === filters.voyage)}
              />
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: "600" }}>Data Inicial:</Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Text>{filters.start_date ? moment(filters.start_date).format("DD/MM/YYYY") : "Selecione a data"}</Text>
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={filters.start_date ? new Date(filters.start_date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleStartDateChange}
                />
              )}
            </View>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 16, marginBottom: 10, fontWeight: "600" }}>Data Final:</Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(true)}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Text>{filters.end_date ? moment(filters.end_date).format("DD/MM/YYYY") : "Selecione a data"}</Text>
              </TouchableOpacity>
              {showEndDatePicker && (
                <DateTimePicker
                  value={filters.end_date ? new Date(filters.end_date) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleEndDateChange}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={resetFilters}
              style={{
                backgroundColor: "#ff6b6b",
                padding: 15,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Limpar Filtros</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

export default ListServicesFilters
