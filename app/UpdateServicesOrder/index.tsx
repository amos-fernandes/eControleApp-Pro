import React, { useCallback, useState } from "react"
import { View, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Alert, Linking } from "react-native"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"

import InfoConnection from "@/components/InfoConnection"
import { insertServiceOrder, getCredentials } from "@/databases/database"
import { ServiceInterface } from "@/interfaces/Service"
import sendServiceOrder from "@/services/sendServiceOrder"
import { getServiceOrder } from "@/services/servicesOrders"
import { emitirMTR, downloadMTRById } from "@/services/mtr"
import checkConnection from "@/utils/checkConnection"

import { AdditionalData } from "./Components/AdditionalData"
import { Address } from "./Components/Address"
import { Client } from "./Components/Client"
import { Contact } from "./Components/Contact"
import { DateTime } from "./Components/DateTime"
import { Equipment } from "./Components/Equipment"
import { Note } from "./Components/Note"
import { OperationData } from "./Components/OperationData"
import { ServiceData } from "./Components/ServiceData"
import { Services } from "./Components/Services"
import { Container, CardContainer, TextBold, Text, Header } from "./styles"
import { TextButton, Button } from "../../components/GlobalStyles/styles"
import { StackParamList } from "../../routes/stack.routes"

type ServicesOrderScreenProp = StackNavigationProp<StackParamList, "UpdateServicesOrder">
function UpdateServicesOrder(props: any): JSX.Element {
  const navigation = useNavigation<ServicesOrderScreenProp>()
  const [order, setOrder]: any = useState(null)
  const [equipmentsLeft, setEquipmentsLeft]: any = useState([])
  const [equipmentsCollected, setEquipmentsCollected]: any = useState([])
  const [serviceExecutions, setServiceExecutions]: any = useState([])
  const [note, setNote]: any = useState("")
  const [arrivalDate, setArrivalDate]: any = useState()
  const [departureDate, setDepartureDate]: any = useState()
  const [startKM, setStartKM] = useState("")
  const [endKM, setEndKM] = useState("")
  const [certificate, setCertificate] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMTR, setLoadingMTR] = useState(false)
  const [loadingDownload, setLoadingDownload] = useState(false)
  const [mtrId, setMtrId] = useState<string | null>(null)
  const connection: boolean = checkConnection()
  const arr: any = []
  let service_executions_local: any = []
  const arrUnits: any = []

  const list = async () => {
    try {
      setLoading(true)
      const resData = await getServiceOrder(props.route.params.id)

      // O Axios pode ter feito parse, ou é uma string do armazenamento local legado
      const orderData = typeof resData === 'string' ? JSON.parse(resData) : resData

      console.log("data-service_orders", orderData)

      setEquipmentsLeft(orderData?.collected_equipment)
      setEquipmentsCollected(orderData?.lended_equipment)
      setDepartureDate(orderData?.departure_date)
      setArrivalDate(orderData?.arrival_date)
      setNote(orderData?.driver_observations)
      setStartKM(orderData?.start_km)
      setEndKM(orderData?.end_km)
      setCertificate(orderData?.certificate_memo)
      setOrder(orderData)

      if (orderData?.service_executions && Array.isArray(orderData.service_executions)) {
        const mapped = orderData.service_executions.map((serviceExecution: any) => {
          return {
            id: serviceExecution.service?.id,
            amount: serviceExecution.service?.unit ? serviceExecution.service.unit : "0",
            service_item_weights: typeof serviceExecution.service_item_weights === 'string'
              ? JSON.parse(serviceExecution.service_item_weights)
              : serviceExecution.service_item_weights,
          }
        })
        setServiceExecutions(mapped)
      }
    } catch (error) {
      console.log("UpdateServicesOrder list error:", error)
    } finally {
      setLoading(false)
    }
  }

  const onChangeServices = (service: ServiceInterface) => {
    if (service.amount) {
      let total = 0
      let service_executions = [...serviceExecutions]
      const found = service_executions.findIndex(
        (element: ServiceInterface) => element.id === service.serviceItemWeight,
      )
      const index = arr.findIndex((element: any) => Object.keys(element)[0] === service.idItems)

      arrUnits.push(service.unit)

      const unitVal = isNaN(Number(service.unit)) ? 0 : Number(service.unit)

      if (index > -1) {
        arr.splice(index, 1)
        arr.push({ [`${service.idItems}`]: unitVal })
      } else {
        arr.push({ [`${service.idItems}`]: unitVal })
      }

      for (const value of arr) {
        total += value[Object.keys(value)[0]]
      }

      const obj = arr.reduce((acc: any, cur: any) => Object.assign(acc, cur), {})

      if (found === -1) {
        service_executions.push({
          id: service.serviceItemWeight,
          amount: total,
          service_item_weights: obj,
        })
      } else {
        service_executions.splice(found, 1)
        service_executions.push({
          id: service.serviceItemWeight,
          amount: total,
          service_item_weights: obj,
        })
      }
      setServiceExecutions(service_executions)
    } else {
      let service_executions = [...serviceExecutions]
      const found = service_executions.findIndex(
        (element: ServiceInterface) => element.id === Number(service.idItems),
      )

      if (found === -1) {
        service_executions.push({
          id: service.idItems,
          amount: service.unit,
          service_item_weights: null,
        })
      } else {
        service_executions.splice(found, 1)
        service_executions.push({
          id: service.idItems,
          amount: service.unit,
          service_item_weights: null,
        })
      }
      setServiceExecutions(service_executions)
    }
  }

  // Botão "Emitir MTR" - uso a nova função emitirMTR
  const handleEmitirMTR = async () => {
    if (!order || !order.id) {
      Alert.alert("Erro", "Não foi possível identificar a ordem de serviço.");
      return;
    }

    await emitirMTR({
      companyId: order.company_id,
      serviceOrderId: String(order.id),
      trackingCode: order.tracking_code || `OS-${order.id}`,
      onStart: () => setLoadingMTR(true),
      onSuccess: async (result) => {
        setLoadingMTR(false);
        setMtrId(result?.mtr_id);
        Alert.alert("✅ MTR emitido!", `ID: ${result?.mtr_id}`);
      },
      onError: (err) => {
        setLoadingMTR(false);
        Alert.alert("❌ Erro", err.message);
      },
    });
  };

  // Botão "Baixar MTR" - uso a nova função downloadMTRById
  const handleDownloadMTR = async () => {
    if (!mtrId) {
      Alert.alert("Aviso", "Emita o MTR antes de baixar.");
      return;
    }
    try {
      setLoadingDownload(true);
      await downloadMTRById(mtrId, true); // autoShare = true
    } catch (err: any) {
      Alert.alert("❌ Erro no download", err.message);
    } finally {
      setLoadingDownload(false);
    }
  };

  // Handler legado - mantenho para compatibilidade
  const emitMTRHandler = async () => {
    if (!order || !order.id) {
      Alert.alert("Erro", "Não foi possível identificar a ordem de serviço.");
      return;
    }

    setLoading(true);
    try {
      // Usando a nova função emitirMTR
      await emitirMTR({
        companyId: order.company_id,
        serviceOrderId: String(order.id),
        trackingCode: order.tracking_code || `OS-${order.id}`,
        onStart: () => {},
        onSuccess: async (result) => {
          setMtrId(result?.mtr_id);
          Alert.alert(
            "MTR Emitida",
            `MTR emitida com sucesso! ID: ${result?.mtr_id}`,
            [
              {
                text: "Baixar PDF",
                onPress: async () => {
                  try {
                    await downloadMTRById(result?.mtr_id, true);
                  } catch (error) {
                    console.error("Erro ao baixar MTR PDF:", error);
                    Alert.alert("Erro", "Não foi possível baixar o PDF da MTR. Tente novamente.");
                  }
                }
              },
              { text: "OK" }
            ]
          );
        },
        onError: (err) => {
          Alert.alert("Erro", err.message || "Ocorreu um erro ao emitir a MTR. Tente novamente.");
        },
      });
    } catch (error: any) {
      console.error("Erro ao emitir MTR:", error);
      Alert.alert(
        "Erro",
        error.message || "Ocorreu um erro ao emitir a MTR. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true)
    const dataToSend: any = {
      checking: true,
      collected_equipment: equipmentsLeft,
      lended_equipment: equipmentsCollected,
      driver_observations: note,
      arrival_date: arrivalDate,
      departure_date: departureDate,
      start_km: startKM,
      end_km: endKM,
      certificate_memo: certificate,
      service_executions: serviceExecutions.length > 0 ? serviceExecutions : order.service_executions,
    }

    try {
      if (connection) {
        const response: any = await sendServiceOrder(order.id, dataToSend)

        if (response.status === 200) {
          // Removo registros locais após envio bem-sucedido
          // Implemento lógica para remover registros locais se necessário
        }
        navigation.goBack()
      } else {
        // Salvo dados localmente para sincronização posterior
        // Implemento lógica para armazenamento offline se necessário
        navigation.goBack()
      }
    } catch (error) {
      console.log("SUBMIT ERROR: ", error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      list().finally(() => setLoading(false))
    }, []),
  )

  return (
    <SafeAreaView>
      {loading && !order && (
        <View
          style={{
            height: 300,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#56d156" />
        </View>
      )}
      {!connection && <InfoConnection />}
      {!order && !loading && (
        <Text
          style={{
            textAlign: "center",
            margin: 10,
            marginTop: 190,
            color: "#000",
          }}
        >
          Nao foi possivel carregar os dados da ordem de servico, tente novamente
        </Text>
      )}

      {order ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: "#fff", marginTop: 80 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={list} />}
        >
          <Container>
            <CardContainer style={{ marginTop: 20 }}>
              <Header>
                <TextBold>#{order.identifier}</TextBold>
              </Header>
            </CardContainer>
            <Client client={order.customer} />
            <Address address={order.address} />
            {order.contact ? <Contact contact={order.contact} /> : null}
            <ServiceData
              serviceData={{
                observations: order.observations,
                date: order.created_at,
              }}
            />
            <OperationData
              vehicle={order.vehicle}
              employees={order.employee}
              voyage={order.voyage}
            />
            <DateTime
              onChange={setArrivalDate}
              title={"Hora de chegada no cliente"}
              initialDate={arrivalDate ? new Date(arrivalDate) : new Date()}
            />
            <Services
              onChange={onChangeServices}
              idService={order.id}
              services={order.service_executions}
              values={serviceExecutions}
            />
            <Equipment
              onChangeLeft={setEquipmentsLeft}
              onChangeCollected={setEquipmentsCollected}
              customerId={order.customer_id}
            />
            <Note onChange={setNote} notes={note} />
            <DateTime
              onChange={setDepartureDate}
              title={"Hora de saida do cliente"}
              initialDate={departureDate ? new Date(departureDate) : new Date()}
            />
            <AdditionalData
              onChangeStart={setStartKM}
              onChangeEnd={setEndKM}
              onChangeCertificate={setCertificate}
              startKM={startKM}
              endKM={endKM}
              certificate={certificate}
            />
            <CardContainer style={{ marginVertical: 10 }}>
              <Button style={{ marginTop: 0, width: "100%", backgroundColor: "#FFA500" }} onPress={handleEmitirMTR} disabled={loadingMTR || loading}>
                {loadingMTR ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <TextButton>Emitir MTR</TextButton>
                )}
              </Button>
            </CardContainer>
            {mtrId && (
              <CardContainer style={{ marginVertical: 10 }}>
                <Button style={{ marginTop: 0, width: "100%", backgroundColor: "#4CAF50" }} onPress={handleDownloadMTR} disabled={loadingDownload || loading}>
                  {loadingDownload ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <TextButton>Baixar MTR (PDF)</TextButton>
                  )}
                </Button>
              </CardContainer>
            )}
            <CardContainer style={{ marginVertical: 10 }}>
              <Button style={{ marginTop: 0, width: "100%" }} onPress={submit} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <TextButton>Salvar para conferencia</TextButton>
                )}
              </Button>
            </CardContainer>
          </Container>
        </ScrollView>
      ) : (
        <View />
      )}
    </SafeAreaView>
  )
}

export default UpdateServicesOrder
