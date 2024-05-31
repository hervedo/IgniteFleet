import styled from "styled-components/native";

export const Container = styled.View`
flex:1;
backgroud-color: ${({ theme }) => theme.COLORS.GRAY_800};
`

export const Content = styled.View`
flex:1;
gap: 16px;
padding: 32px;
margin-top: 16px;
`

export const Message = styled.Text`
color: ${({ theme }) => theme.COLORS.WHITE};
font-family: ${({ theme }) => theme.FONT_FAMILY.BOLD};
textAlign: center;
margin: 24px;
`