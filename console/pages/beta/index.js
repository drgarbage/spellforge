import { Grid, Card, Text, Link, Container } from "@nextui-org/react";

const CardButton = ({title, href, image}) => 
  <Card isPressable as={Link} href={href}>
    <Card.Image src={image} objectFit="cover" />
    <Card.Footer css={{justifyContent: 'center', position: 'absolute', bottom:0, backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <Text color="white" weight="bold">{title}</Text>
    </Card.Footer>
  </Card>

export default () => {
  const interfaces = [
    {
      title:"人偶相機",
      href:"/beta/live-figure",
      image:"https://ai.printii.com/api/ipfs/QmTm6kbp3iAJdZtNEKNmGtjqsmBgJKZakynbq4GQTYiHzb"
    },
    {
      title:"卡通相機",
      href:"/beta/anime",
      image:"https://ai.printii.com/api/ipfs/QmdMzKy8VvTvw6LwgsgxAgK2xL2Tp6z5CuLmkC1DdV3jtK"
    },
    {
      title:"線稿相機",
      href:"/beta/outline",
      image:"https://ai.printii.com/api/ipfs/Qmbcd73HRufwVJxoDbS3owhE8aRR8RhtbLUYh66oeR7MrY"
    },
    {
      title:"填色相機",
      href:"/beta/painting",
      image:"https://ai.printii.com/api/ipfs/Qmf8DCHNTQARsPJB9rWhAUKVZb2V1tSHKWBhpEDqW4FEpY"
    },
  ];

  return (
    <Container>
      <Grid.Container gap={1}>
        <Grid xs={12}>
          <Text weight="bold">CAMERAS</Text>
        </Grid>
        { interfaces.map(({title, href, image}) => 
          <Grid key={href} lg={2} md={3} sm={4} xs={6}>
            <CardButton 
              title={title}
              href={href}
              image={image}
              />
          </Grid>
        )}
      </Grid.Container>
    </Container>
  );
}