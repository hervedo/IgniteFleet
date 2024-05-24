import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput } from "react-native";
import { useUser } from "@realm/react";
import { useNavigation } from '@react-navigation/native'

import { useRealm } from "../../libs/realm";
import { Historic } from "../../libs/realm/schemas/Historic";

import { Container, Content } from "./styles";

import { Button } from "../../components/Button";
import { Header } from "../../components/Header";
import { LicensePlateInput } from "../../components/LicensePlateInput";
import { TextAreaInput } from "../../components/TextAreaInput";

import { licensePlateValidate } from "../../utils/licensePlateValidate";


const keyboardAvoidingViewBehavior = Platform.OS === 'android' ? 'height' : 'position'

export function Departure() {

    const [description, setDescription] = useState('')
    const [licensePlate, setLicensePlate] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)

    const { goBack } = useNavigation()

    const realm = useRealm()
    const user = useUser()

    const descriptionRef = useRef<TextInput>(null)
    const licensePlateRef = useRef<TextInput>(null)

    function handleDepartureRegister() {
        try {
            if (!licensePlateValidate(licensePlate)) {
                licensePlateRef.current?.focus()
                return Alert.alert('Placa inválida', 'A placa é inválida, confirme a placa correta do veículo')
            }

            if (description.trim().length === 0) {
                descriptionRef.current?.focus()
                return Alert.alert('Finalidade', 'Informe a finalidade da utilização do veículo');

            }

            setIsRegistering(true)

            realm.write(() => {
                realm.create('Historic', Historic.generate({
                    user_id: user!.id,
                    license_place: licensePlate.toUpperCase(),
                    description
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

    return (
        <Container>
            <Header title="Saída" />
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={keyboardAvoidingViewBehavior}>
                <ScrollView>
                    <Content>
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
            </KeyboardAvoidingView>

        </Container >

    )
}