import { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, TextInput } from "react-native";
import { useUser } from "@realm/react";
import { useNavigation } from '@react-navigation/native'
import { LocationAccuracy, LocationObjectCoords, LocationSubscription, requestBackgroundPermissionsAsync, useForegroundPermissions, watchPositionAsync } from 'expo-location'
import { Car } from "phosphor-react-native";

import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";

import { Container, Content, Message, MessageContent } from "./styles";

import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";
import { Loading } from "../../components/Loading";
import { LocationInfo } from "../../components/LocationInfo";

import { licensePlateValidate } from "../../utils/licensePlateValidate";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getAddressLocation } from "../../utils/getAddressLocation";
import { Map } from "../../components/Map";
import { startLocationTask } from "../../tasks/backgroundLocationTask";
import { openSettings } from "../../utils/openSettings";


export function Departure() {

    const [description, setDescription] = useState('')
    const [licensePlate, setLicensePlate] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [isLoadingLocation, setIsLoadingLocation] = useState(true)
    const [currentAddress, setCurrentAddress] = useState<string | null>(null)
    const [currentCoords, setCurrentCoords] = useState<LocationObjectCoords | null>(null)

    const [locationForegroundPermission, requestLocationForegroundPermission] = useForegroundPermissions();


    const { goBack } = useNavigation()

    const realm = useRealm()
    const user = useUser()

    const descriptionRef = useRef<TextInput>(null)
    const licensePlateRef = useRef<TextInput>(null)

    async function handleDepartureRegister() {
        try {
            if (!licensePlateValidate(licensePlate)) {
                licensePlateRef.current?.focus()
                return Alert.alert('Placa inválida', 'A placa é inválida, confirme a placa correta do veículo')
            }

            if (description.trim().length === 0) {
                descriptionRef.current?.focus()
                return Alert.alert('Finalidade', 'Informe a finalidade da utilização do veículo');

            }

            if (!currentCoords?.latitude && !currentCoords?.longitude) {
                return Alert.alert('Localização!', 'Não foi possível obter a localização atual. Tente Novamente!');
            }

            setIsRegistering(true)


            const backgroundPermissions = await requestBackgroundPermissionsAsync()

            if (!backgroundPermissions.granted) {
                setIsRegistering(false)

                return Alert.alert(
                    "Localização",
                    'É necessário permitir que o App tenha acesso a localização em segundo plano. Acesse as configurações do dispositivo e habilite "Permitir o tempo todo".',
                    [
                        { text: 'Abrir Configurações', onPress: openSettings }
                    ]
                )
            }

            await startLocationTask();

            realm.write(() => {
                realm.create('Historic', Historic.generate({
                    user_id: user!.id,
                    license_place: licensePlate.toUpperCase(),
                    description,
                    coords: [{
                        latitude: currentCoords.latitude,
                        longitude: currentCoords.longitude,
                        timestamp: new Date().getTime()
                    }]
                }))
            })

            Alert.alert('Saída', 'Saída do veículo registrada com sucesso!')

            goBack()



        } catch (error) {
            console.log(error)
            Alert.alert('Erro', 'Não foi possível registrar a saída do veículo')
            setIsRegistering(false)

        }
    }

    useEffect(() => {
        requestLocationForegroundPermission()
    }, [])

    useEffect(() => {

        if (!locationForegroundPermission?.granted) {
            return;
        }

        let subscription: LocationSubscription;

        watchPositionAsync({
            accuracy: LocationAccuracy.High,
            timeInterval: 1000

        }, (location) => {
            setCurrentCoords(location.coords)
            getAddressLocation(location.coords).then((address) => {
                if (address) {
                    setCurrentAddress(address)
                }
            })
                .finally(() => setIsLoadingLocation(false))
        }).then((response) => subscription = response)

        return () => {
            if (subscription) {
                subscription.remove()
            }
        }


    }, [locationForegroundPermission])

    if (!locationForegroundPermission?.granted) {
        return (
            <Container>
                <Header title="Saída" />

                <MessageContent>
                    <Message>Você precisa permitir que o App tenha acesso a localização.
                        Por favor, acesse as configurações do seu dispositivo para conceder a permissão ao App.
                    </Message>

                    <Button title="Abrir Configurações" onPress={openSettings} />

                </MessageContent>
            </Container>
        )
    }

    if (isLoadingLocation) {
        return (
            <Loading />
        )
    }

    return (
        <Container>
            <Header title="Saída" />

            <KeyboardAwareScrollView extraHeight={100}>
                <ScrollView>
                    {currentCoords && <Map coordinates={[currentCoords]} />}
                    <Content>
                        {
                            currentAddress &&
                            <LocationInfo icon={Car} label='Localização Atual' description={currentAddress} />
                        }

                        <LicensePlateInput
                            ref={licensePlateRef}
                            label="Placa do Veículo"
                            placeholder="BRA1234"
                            onSubmitEditing={() => descriptionRef.current?.focus()}
                            returnKeyType="next"
                            onChangeText={setLicensePlate}
                        />

                        <TextAreaInput
                            ref={descriptionRef}
                            label="Finalidade"
                            placeholder="Vou utilizar o veículo para..."
                            onSubmitEditing={handleDepartureRegister}
                            returnKeyType="send"
                            blurOnSubmit
                            onChangeText={setDescription}
                        />

                        <Button title="Registrar Saída" onPress={handleDepartureRegister} isLoading={isRegistering} />

                    </Content>
                </ScrollView>
            </KeyboardAwareScrollView>


        </Container >

    )
}