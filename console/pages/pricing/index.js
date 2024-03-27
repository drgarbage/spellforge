import { Card, Container, Grid, Text } from "@nextui-org/react"
import { useState } from "react";

export default () => {
  const [duration, setDuration] = useState('monthly');
  const pricingPackages = {
    monthly: [
      { 
        id: 'TRIAL',
        name: 'Trial', 
        headerStyle: {},
        headerTextStyle: {},
        headerColor: 'orange',
        headerTextColor: 'white',
        price: 'Free', 
        points: '20',
        description: 'Try all possible generation you like. Please checkout Grimoires let our creators shared.',
        features: [
        ] 
      },
      {
        id: 'LITE',
        name: 'Basic', 
        headerColor: 'blue',
        headerTextColor: 'white',
        price: '299 /Month', 
        points: '3000',
        description: '',
        features: [
          '5000 points',
          'All Advance Functions',
        ] 
      },
      {
        id: 'PRO',
        name: 'Creator', 
        headerColor: 'navy',
        headerTextColor: 'white',
        price: '599 /Month', 
        points: '6000',
        description: '',
        features: [
          'Standard Size 20p/day',
          '15000 points',
          'All Advance Functions',
        ] 
      },
      {
        id: 'ENTERPRISE',
        name: 'Creator', 
        headerColor: 'orange',
        headerTextColor: 'white',
        price: 'Contact US', 
        points: 'Unlimited',
        description: '',
        features: [
          'Standard Size 20p/day',
          '15000 points',
          'All Advance Functions',
        ] 
      }
    ],
    annual: []
  }
  return (
    <Container>
      <style jsx global>
        {`
          .title {
            color: white;
            font-weight: bold;
          }
          .TRIAL .header {
            background-color: green;
          }
          .TRIAL .title {
            
          }
          .LITE .header {
            background-color: blue;
          }
          .LITE .title {

          }
          .PRO .header {
            background-color: navy;
          }
          .PRO .title {

          }
          .ENTERPRISE .header {
            background-color: red;
          }
          .ENTERPRISE .title {

          }
        `}
      </style>
      <Grid.Container gap={1}>
        <Grid xs={12}><Text>Pricing</Text></Grid>
        {pricingPackages[duration].map((item) => 
          <Grid key={item.name} xs={6} sm={3}>
            <Card className={item.id} variant="bordered">
              <Card.Header className="header" css={{backgroundColor: item.headerColor}}>
                <Text className="title" css={{fontSize: '120%', color: item.headerTextColor}}>{item.name}</Text>
              </Card.Header>
              <Card.Body>
                <Text css={{fontWeight: 'bold'}}>{item.price}</Text>
                <Text>{item.description}</Text>
              </Card.Body>
            </Card>
          </Grid>
        )}
      </Grid.Container>
    </Container>
  );
}