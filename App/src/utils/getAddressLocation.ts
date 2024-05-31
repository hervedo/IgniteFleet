import { LocationObjectCoords, reverseGeocodeAsync } from "expo-location";

export async function getAddressLocation({ latitude, longitude }: LocationObjectCoords) {
    try {
        const addressResponse = await reverseGeocodeAsync({ latitude, longitude })

        return (addressResponse[0]?.street + " - " + addressResponse[0]?.streetNumber)

    } catch (error) {
        console.log(error)

    }

}