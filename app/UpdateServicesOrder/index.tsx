import React, { useCallback, useState } from "react"
import { View, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator, Alert } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useRouter, useLocalSearchParams } from "expo-router"

import InfoConnection from "@/components/InfoConnection"
import ImageUploader from "@/components/ImageUploader"
import { ServiceInterface } from "@/interfaces/Service"
import sendServiceOrder from "@/services/sendServiceOrder"
import uploadImage from "@/services/uploadImage"
import { getServiceOrder } from "@/services/servicesOrders"
import checkConnection from "@/utils/checkConnection"
import { insertServiceOrderImage, getServiceOrderImages } from "@/databases/database"

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

function UpdateServicesOrder(): JSX.Element {
  const router = useRouter()
  const params = useLocalSearchParams()
  const id = params.id as string
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const connection: boolean = checkConnection()
  const arr: any = []
  let service_executions_local: any = []
  const arrUnits: any = []

  const list = async () => {
    try {
      setLoading(true)
      const resData = await getServiceOrder(id)

      // Axios may have already parsed it, or it's a string from legacy local storage
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

  const submit = async () => {
    setLoading(true)
    
    try {
      // Upload de imagem se selecionada
      let imageUrl = null
      if (selectedImage) {
        const uploadResponse: any = await uploadImage(selectedImage, order.id)
        if (uploadResponse?.status === 200 && uploadResponse.data?.image_url) {
          imageUrl = uploadResponse.data.image_url
          // Armazenar a URL da imagem no banco de dados local
          insertServiceOrderImage(order.id, imageUrl, selectedImage)
        } else {
          Alert.alert(
            "Erro ao Upload de Imagem",
            "Não foi possível fazer o upload da imagem. Tente novamente."
          )
          setLoading(false)
          return
        }
      }

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
        image_url: imageUrl,
      }

      const response: any = await sendServiceOrder(order.id, dataToSend)
      if (response.status === 200) {
        router.back()
      }
    } catch (error) {
      console.log("SUBMIT ERROR: ", error)
      Alert.alert(
        "Erro ao Enviar",
        "Ocorreu um erro ao enviar os dados. Tente novamente."
      )
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
             <ImageUploader
               onImageSelected={setSelectedImage}
               selectedImage={selectedImage}
               onRemoveImage={() => setSelectedImage(null)}
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
