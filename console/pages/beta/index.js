import { Grid, Card, Text, Link } from "@nextui-org/react";

const CardButton = ({title, href, image}) => 
  <Card isPressable as={Link} href={href}>
    <Card.Image src={image} />
    <Card.Footer css={{justifyContent: 'center', position: 'absolute', bottom:0, backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <Text color="white" weight="bold">{title}</Text>
    </Card.Footer>
  </Card>

export default () => {
  return (
    <Grid.Container gap={1}>
      <Grid lg={2} md={3} xs={6}>
        <CardButton 
          title="人偶相機"
          href="/beta/live-figure"
          image="https://ai.printii.com/api/ipfs/QmTm6kbp3iAJdZtNEKNmGtjqsmBgJKZakynbq4GQTYiHzb"
          />
      </Grid>
      <Grid lg={2} md={3} xs={6}>
        <CardButton
          title="卡通相機"
          href="/beta/anime"
          image="https://ai.printii.com/api/ipfs/QmdMzKy8VvTvw6LwgsgxAgK2xL2Tp6z5CuLmkC1DdV3jtK"
          />
      </Grid>
      <Grid lg={2} md={3} xs={6}>
        <CardButton
          title="線稿相機"
          href="/beta/outline"
          image="https://ai.printii.com/api/ipfs/QmTJpRuvmoukzcXAmVATGDD8LKp2p76fonZoke2AbFRFLa"
          />
      </Grid>
    </Grid.Container>
  );
}