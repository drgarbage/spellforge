import { useState } from "react";
import { useUserContext } from "context";
import { Avatar, Button, Card, Collapse, Container, Grid, Input, Text, Row, Spacer, Loading, Col, Textarea } from "@nextui-org/react";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { completions } from "libs/api-openai";

const SectionTitle = ({num, title}) =>
  <Row align="center"><Avatar squared size="md" text={num.toString()} /><Spacer x={1} /><Text h3>{title}</Text></Row>;

export default () => {
  const router = useRouter();
  const { preferences, setPreference } = useUserContext();
  const { openai } = preferences;
  const [ prompt, setPrompt ] = useState('What GPT stands for?');
  const [ result, setResult ] = useState(null);
  const [ error, setError ] = useState(null);
  const [ loading, setLoading ] = useState(false);
  const onTest = async () => {
    try{
      setError(null);
      setLoading(true);
      const rs = await completions({prompt, apiKey: openai});
      setResult(rs);
    } catch(err) {
      setError("Call to OpenAI fail due to error: " + err.message);
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
                  <Text h1>Setup OpenAI</Text>
                  <Text>OpenAI provide free trial for each new account, by setting the API key, this interface will consume your quota.</Text>
                </Container>
                <Collapse.Group>
                  <Collapse title={<SectionTitle num={1} title="Sign up to OpenAI" />}>
                    <ol>
                      <li>Visit <a href="https://chat.openai.com/">OpenAI</a>.</li>
                      <li>Sign up for an account.</li>
                    </ol>
                  </Collapse>

                  <Collapse title={<SectionTitle num={2} title="Create API Key" />}>
                    <ol>
                      <li>Once you activate your account, navigate to <a href="https://platform.openai.com/account/api-keys">API Keys</a> page.</li>
                      <li>Click the <span>Create new secret key</span> on the bottom of API Keys page.</li>
                      <li>Copy the KEY, which looks like "sk-...adaW".</li>
                    </ol>
                  </Collapse>

                  <Collapse title={<SectionTitle num={3} title="Paste API Key here" />} expanded>
                    <Input 
                        css={{width: '100%'}}
                        aria-label="OpenAI API KEY"
                        type="text"
                        placeholder="sk-xxxx"
                        initialValue={openai} 
                        onChange={e => setPreference('openai', e.target.value)} 
                        helperColor="secondary"
                        helperText="The API key will store in your device"
                        />
                  </Collapse>

                  <Collapse title={<SectionTitle num="FIN" title="Test Connection" />}>
                    <Input 
                      css={{width: '100%'}}
                      aria-label="OpenAI API KEY"
                      placeholder="sk-xxxx"
                      initialValue={prompt} 
                      onChange={e => setPrompt(e.target.value)} 
                      labelRight={
                        <Button auto light 
                          css={{padding:0}} 
                          color="primary"
                          onPress={onTest}>
                          {loading ? <Loading /> : "TEST"}
                        </Button>
                      }/>

                      <Spacer />

                      {error && <Text color="error">{error}</Text>}

                      {result && 
                        <Card variant="bordered">
                          <Card.Body>
                            <Textarea 
                              readOnly
                              label="ChatGPT response"
                              value={result?.data?.choices[0].text.trim()} 
                              />
                            <Col>
                              <Text h4>You're All Set!</Text>
                              <Text>The connection test was successful</Text>
                            </Col>
                          </Card.Body>
                          <Card.Footer>
                            <Button css={{width: '100%'}} onPress={() => router.back()}>Continue</Button>
                          </Card.Footer>
                        </Card>
                      }
                  </Collapse>
                </Collapse.Group>
              </Card.Body>
            </Card>
          </Grid>
        </Grid.Container>
      </Container>
    </>
  );
}