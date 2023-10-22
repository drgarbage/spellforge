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
      const { txt2img, TXT2IMG_DEFAULTS } = api(sdapi);
      const { images } = await txt2img({...TXT2IMG_DEFAULTS, prompt: '1girl'});
      setImage(images[0]);
    } catch(err) {
      setError("連線時發生錯誤: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Container fluid gap={1}>
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
                  <Text h1>連線到 Stable Diffusion</Text>
                  <Text>為了使用您自己的 Stable Diffusion 繪圖, 您必須啟用伺服器的 API 及 分享 功能. 請參考以下步驟來完成設定:</Text>
                </Container>
                <Collapse.Group>
                  <Collapse 
                    title={<SectionTitle num={1} title="取得網址" />}
                    subtitle="若已知網址則可略過此步驟">
                    <ol>
                      <li>使用文字編輯器開啟 webui-user.bat, 找到這一行 "set COMMANDLINE_ARGS".</li>
                      <li>加入參數: "--share --api --listen --cors-allow-origins=*".<br/>
                        <div style={{backgroundColor: '#ddd', padding: 20, margin: '10px 0 10px 0'}}>
                          set COMMANDLINE_ARGS=--xformers <span style={{color: 'blue'}}>--share --api --listen --cors-allow-origins=*</span>
                        </div>
                      </li>
                      <li>儲存並重啟 Stable Diffusion.</li>
                      <li>當服務開啟完成時，您將會在命令提示字元視窗看到以下連結:
                        <div style={{backgroundColor: 'black', color: 'white', padding: 20, margin: '10px 0 10px 0'}}>
                          Running on local URL: <span style={{textDecoration: 'underline'}}>http://localhost:7860</span><br/>
                          Running on public URL: <span style={{color: 'yellow', textDecoration: 'underline'}}>https://0f26d7a5-46c1-4cca.gradio.live</span>
                        </div>
                      </li>
                    </ol>
                  </Collapse>
                  <Collapse 
                    expanded 
                    title={<SectionTitle num={2} title="修改SDAPI網址" />}
                    subtitle="複製公開網址並貼到下方輸入框中">
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
                    title={<SectionTitle num="FIN" title="測試連線" />}
                    >
                    <Button disabled={loading} onPress={onGenerate}>
                      {loading && <Loading size="sm" />}
                      {!loading && <Text color="white">測試</Text>}
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
                            <Text h4>恭喜你</Text>
                            <Text>連線測試成功，您可以開始使用了</Text>
                          </Col>
                        </Card.Body>
                        <Card.Footer>
                          <Button css={{width:'100%'}} onPress={() => router.back()}>繼續</Button>
                        </Card.Footer>
                      </Card>
                    }
                  </Collapse>
                </Collapse.Group>


                {
                  (!!sdapi && (sdapi?.indexOf('localhost') >= 0 || sdapi?.indexOf('127.0.0.1') >= 0)) &&
                  <Text color="error">提醒：使用 localhost 或 127.0.0.1 路徑需在 Stable Diffusion 同一台主機上使用本站喔。</Text>
                }
                
                {
                  !!sdapi && sdapi?.startsWith('http:') && location.protocol !== 'http:' &&
                  <>
                    <Text color="error">請注意：您設定的路徑需切換為 HTTP 版本網頁</Text>
                    <a href="http://ai.printii.com">點此前往</a>
                  </>
                }

                {
                  !!sdapi && sdapi.startsWith('https:') && location.protocol !== 'https:' &&
                  <>
                    <Text color="error">請注意：您設定的路徑需切換為 HTTPS 版本網頁{location.protocol}</Text>
                    <a href="https://ai.printii.com">點此前往</a>
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