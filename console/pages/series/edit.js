import { useState } from "react";
import { useRouter } from "next/router";
import { Button, Card, Grid, Input, Col, Row } from "@nextui-org/react"
import { append } from "libs/api-firebase";

const SERIES_LAYOUT = {
  name: '',
  type: 'PatternGenerator',
  photos: [],
  linked: {
    instagram: {
      username: '',
      password: ''
    }
  },
  prompt: '',
  comment: '[auto-comment]',
}

export default (props) =>{
  const [ name, setName ] = useState('');
  const router = useRouter();

  const createSeriesAndContinue = async () => {
    if(!name || name.length === 0) return;
    const rs = await append('series', { ...SERIES_LAYOUT, name, createAt: new Date() });
    router.push(`/series/edit/${rs.id}`);
  }

  return (
    <Grid.Container justify="center">
      <Grid xs={8} sm={6} md={4} css={{display: 'flex', flexDirection: 'column', justifyContent:'center', height: '100vh' }}>
        <Card>
          <Card.Image 
            src="/images/cardface.png"
            />
          <Card.Body>
            <Col>
              <Input 
                css={{width: '100%'}}
                label="建立新模板" 
                placeholder="請輸入模板名稱"
                initialValue={name}
                onChange={e => setName(e.target.value)}
                />
            </Col>
          </Card.Body>
          <Card.Footer>
            <Button 
              auto
              css={{width: '100%'}}
              disabled={!name || name.length === 0}
              onClick={createSeriesAndContinue}>新增模板</Button>
          </Card.Footer>
        </Card>
      </Grid>
    </Grid.Container>
  );
}