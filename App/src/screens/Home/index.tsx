import { useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import { useQuery } from '../../libs/realm'
import { Historic } from '../../libs/realm/schemas/Historic'

import { Container, Content } from './styles'

import { CarStatus } from '../../components/CarStatus'
import { HomeHeader } from '../../components/HomeHeader'

export function Home() {

    const [vehicleInUse, setVehicleInUse] = useState<Historic | null>(null)

    const { navigate } = useNavigation()

    const historic = useQuery(Historic)

    function handleRegisterMovement() {
        if (vehicleInUse?._id) {
            return navigate('arrival', { id: vehicleInUse._id.toString() })

        } else {
            navigate('departure')

        }
    }

    function handleFetchVehicle() {
        try {
            const vehicle = historic.filtered("status = 'departure'")[0]

            setVehicleInUse(vehicle)
        } catch (error) {
            Alert.alert('Veículo em uso', 'Não foi possível carregar o veículo em uso.')
            console.log(error)
        }

    }

    useEffect(() => { handleFetchVehicle }, [])

    return (
        <Container >
            <HomeHeader />
            <Content>
                <CarStatus licensePlate={vehicleInUse?.license_place} onPress={handleRegisterMovement} />
            </Content>
        </Container>
    )
}