import { useState } from "react";
import { useUserContext } from "context";
import { Avatar, Button, Card, Collapse, Container, Grid, Input, Text, Row, Spacer, Loading, Col } from "@nextui-org/react";
import api from "libs/api-sd-remote";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { ensureImageURL } from "libs/utils";

const SectionTitle = ({num, title}) =>
  <Row align="center"><Avatar squared size="md" text={num.toString()} /><Spacer x={1} /><Text h3>{title}</Text></Row>;

export default () => {
  const router = useRouter();
  const { preferences, setPreference } = useUserContext();
  const { sdapi } = preferences;
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const [ image, setImage ] = useState(null);

  const onGenerate = async () => {
    try{
      setError(null);
      setLoading(true);
      const { txt2img, TXT2IMG_DEFAULTS } = api(sdapi.replace('http://', '').replace('https://', ''));
      const { images } = await txt2img({...TXT2IMG_DEFAULTS, prompt: '1girl'});
      setImage(images[0]);
    } catch(err) {
      setError("Unable to generate image due to error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Container gap={1} css={{marginTop: 80}}>
        <Grid.Container gap={1} justify="center" css={{minHeight: '100vh'}}>
          <Grid xs={12} sm={6}>
            <Card>
              <Card.Header>
                <Button auto light 
                  css={{position: 'absolute', top: 10, right: 10}}
                  onPress={() => router.back()} 
                  icon={<FontAwesomeIcon size="lg" icon={faClose} />} />
              </Card.Header>
              <Card.Body>
                <Container>
                  <Text h1>Connect Stable Diffusion</Text>
                  <Text>To generate image with your own Stable Diffusion, you must launch your engine with api public to internet. Follow steps below to config your own engine:</Text>
                </Container>
                <Collapse.Group>
                  <Collapse 
                    title={<SectionTitle num={1} title="Get Public URL" />}
                    subtitle="skip this if you already have the public URL.">
                    <ol>
                      <li>Open webui-user.bat, find the line start with "set COMMANDLINE_ARGS".</li>
                      <li>Add arguments: "--share --api --listen --cors-allow-origins=*".<br/>
                        <div style={{backgroundColor: '#ddd', padding: 20, margin: '10px 0 10px 0'}}>
                          set COMMANDLINE_ARGS=--xformers <span style={{color: 'blue'}}>--share --api --listen --cors-allow-origins=*</span>
                        </div>
                      </li>
                      <li>Save and restart Stable Diffusion.</li>
                      <li>Once the service starts correctly, you should find a public link listed in terminal screen:
                        <div style={{backgroundColor: 'black', color: 'white', padding: 20, margin: '10px 0 10px 0'}}>
                          Running on local URL: <span style={{textDecoration: 'underline'}}>http://localhost:7860</span><br/>
                          Running on public URL: <span style={{color: 'yellow', textDecoration: 'underline'}}>https://0f26d7a5-46c1-4cca.gradio.live</span>
                        </div>
                      </li>
                    </ol>
                  </Collapse>
                  <Collapse 
                    expanded 
                    title={<SectionTitle num={2} title="Change the SDAPI URL" />}
                    subtitle="Copy the public link and paste here">
                    <Input
                      aria-label="Public URL"
                      type="url"
                      css={{width: '100%'}}
                      placeholder="https://0f26d7a5-46c1-4cca.gradio.live" 
                      initialValue={sdapi} 
                      onChange={e => setPreference('sdapi', e.target.value)}
                      />
                  </Collapse>
                  <Collapse 
                    title={<SectionTitle num="FIN" title="Test Connection" />}
                    >
                    <Button disabled={loading} onPress={onGenerate}>
                      {loading && <Loading size="sm" />}
                      {!loading && <Text color="white">GENERATE</Text>}
                    </Button>
                    <Spacer y={1} />

                    {error && <Text color="error">{error}</Text>}

                    {image && 
                      <Card variant="bordered">
                        <Card.Image 
                          src={ensureImageURL(image)}
                          objectFit="cover"
                          />
                        <Card.Body>
                          <Col>
                            <Text h4>Congratulations</Text>
                            <Text>The connection test was successful</Text>
                          </Col>
                        </Card.Body>
                        <Card.Footer>
                          <Button css={{width:'100%'}} onPress={() => router.back()}>Continue</Button>
                        </Card.Footer>
                      </Card>
                    }
                  </Collapse>
                </Collapse.Group>

                {
                  (!!sdapi && (sdapi?.indexOf('localhost') >= 0 || sdapi?.indexOf('127.0.0.1') >= 0)) &&
                  <Text color="warning">Reminder: When connecting to localhost or 127.0.0.1, please make sure you running this page in the same machine with Stable Diffusion.</Text>
                }
                
                {
                  !!sdapi && sdapi?.startsWith('http:') && location.protocol !== 'http:' &&
                  <>
                    <Text color="error">Notice: Your Stable Diffusion is't running under HTTPS, to allow connection, please navigate to our HTTP site instead.</Text>
                    <a href="http://ai.printii.com">Click HERE to HTTP Site</a>
                  </>
                }

                {
                  !!sdapi && sdapi.startsWith('https:') && location.protocol !== 'https:' &&
                  <>
                    <Text color="error">Notice: Your Stable Diffusion is under HTTPS protection, therefore, you need to navigate to our HTTPS site to allow connection.</Text>
                    <a href="https://ai.printii.com">Click HERE to HTTPS Site</a>
                  </>
                }
              </Card.Body>
            </Card>
          </Grid>
        </Grid.Container>
      </Container>
    </>
  );
}