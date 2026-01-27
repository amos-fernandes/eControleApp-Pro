import React, { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView } from "react-native"
import { SelectList } from "react-native-dropdown-select-list"
import DateTimePicker from "@react-native-community/datetimepicker"
import moment from "moment"

import { useFilterServiceOrderStore } from "@/stores/useFilterServiceOrder"

const ListServicesFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useFilterServiceOrderStore()
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)

  const statusOptions = [
    { key: "all", value: "Todas" },
    { key: "acting", value: "Atuando" },
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
    <ScrollView style={{ padding: 20, backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20, textAlign: "center" }}>
        Filtros de Ordens de Serviço
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Status:</Text>
        <SelectList
          setSelected={(val: string) => setFilters({ status: val })}
          data={statusOptions}
          save="key"
          placeholder="Selecione o status"
          defaultOption={statusOptions.find(opt => opt.key === filters.status)}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Tipo:</Text>
        <SelectList
          setSelected={(val: string) => setFilters({ so_type: val })}
          data={typeOptions}
          save="key"
          placeholder="Selecione o tipo"
          defaultOption={typeOptions.find(opt => opt.key === filters.so_type)}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Viagem:</Text>
        <SelectList
          setSelected={(val: string) => setFilters({ voyage: val })}
          data={voyageOptions}
          save="key"
          placeholder="Selecione a viagem"
          defaultOption={voyageOptions.find(opt => opt.key === filters.voyage)}
        />
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Data Inicial:</Text>
        <TouchableOpacity
          onPress={() => setShowStartDatePicker(true)}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
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
        <Text style={{ fontSize: 16, marginBottom: 10 }}>Data Final:</Text>
        <TouchableOpacity
          onPress={() => setShowEndDatePicker(true)}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
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
          borderRadius: 5,
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>Limpar Filtros</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default ListServicesFilters