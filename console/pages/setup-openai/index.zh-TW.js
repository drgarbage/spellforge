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
  const [ prompt, setPrompt ] = useState('GPT是什麼的縮寫?');
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
      setError("測試 OpenAI 時發生錯誤: " + err.message);
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
                  <Text h1>設定 ChatGPT</Text>
                  <Text>OpenAI 有提供每個新帳號免費試用額度, 此介面需要 API Key 憑證以調用 API, 請注意, 調用 API 將消耗您的額度.</Text>
                </Container>
                <Collapse.Group>
                  <Collapse title={<SectionTitle num={1} title="註冊 OpenAI 帳號" />}>
                    <ol>
                      <li>瀏覽 <a href="https://chat.openai.com/">OpenAI</a> 官網.</li>
                      <li>註冊一個新帳號, 若您註冊過 ChatGPT, 則可延用該帳號.</li>
                    </ol>
                  </Collapse>

                  <Collapse title={<SectionTitle num={2} title="取得 API Key" />}>
                    <ol>
                      <li>當您成功啟用帳號後, 開啟 <a href="https://platform.openai.com/account/api-keys">API Keys</a> 頁面.</li>
                      <li>點選 API Keys 頁面下方的 <span>Create new secret key</span> 按鈕以生成新的 API Key. (若您有舊的也可以沿用)</li>
                      <li>複製 KEY 值, 通常是 "sk-...adaW" 的格式.</li>
                    </ol>
                  </Collapse>

                  <Collapse title={<SectionTitle num={3} title="將 API Key 貼在下方輸入匡" />} expanded>
                    <Input 
                        css={{width: '100%'}}
                        aria-label="OpenAI API KEY"
                        placeholder="sk-xxxx"
                        initialValue={openai} 
                        onChange={e => setPreference('openai', e.target.value)} 
                        helperColor="secondary"
                        helperText="這個 API Key 只會存在您的本機裝置"
                        />
                  </Collapse>

                  <Collapse title={<SectionTitle num="FIN" title="測試連線" />}>
                    <Input 
                      css={{width: '100%'}}
                      aria-label="OpenAI API KEY"
                      type="text"
                      placeholder="sk-xxxx"
                      initialValue={prompt} 
                      onChange={e => setPrompt(e.target.value)} 
                      labelRight={
                        <Button auto light 
                          css={{padding:0}} 
                          color="primary"
                          onPress={onTest}>
                          {loading ? <Loading /> : "測試"}
                        </Button>
                      }/>

                      <Spacer />

                      {error && <Text color="error">{error}</Text>}

                      {result && 
                        <Card variant="bordered">
                          <Card.Body>
                            <Textarea 
                              readOnly
                              label="ChatGPT 回應"
                              value={result?.data?.choices[0].text.trim()} 
                              />
                            <Col>
                              <Text h4>一切就緒！</Text>
                              <Text>連線測試成功，您可以使用 ChatGPT 來產生提示詞了。</Text>
                            </Col>
                          </Card.Body>
                          <Card.Footer>
                            <Button css={{width: '100%'}} onPress={() => router.back()}>繼續</Button>
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