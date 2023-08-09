import { Button, Textarea, Input, Text, Divider, Switch, Row, Spacer, Modal, Loading, Link, Col } from "@nextui-org/react"
import { useUserContext } from "context";
import { append, update, upload } from "libs/api-firebase";
import { updateGrimoire } from "libs/api-storage";
import { asBase64Image } from "libs/utils";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { User } from "react-iconly";
import moment from "moment-timezone";


export default ({config, onConfigChange}) => {
  const { t } = useTranslation();
  const { preferences } = useUserContext();
  const { author } = preferences;
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState(null);
  const [ showPublish, setShowPublish ] = useState(false);

  const onPublish = async () => {
    setShowPublish(true);
    try{
      setError(null);
      setLoading(true);
      const grimoire = {...config};
      
      delete grimoire.id;

      if(grimoire.photos.length > 0 && grimoire.photos[0].startsWith('data:')) {
        const photo = grimoire.photos[0];
        const url = await upload(
          `/grimoires/${moment().unix()}.png`, 
          asBase64Image(photo), 
          {contentType: 'image/png'
        });
        grimoire.photos = [url];
      }
      const doc = !!grimoire?.publishedAt ?
        await update('grimoires', grimoire?.publishedAt, grimoire).then(() => ({id: grimoire?.publishedAt})):
        await append('grimoires', grimoire);
      updateGrimoire(config.id, {...config, publishedAt: doc.id });
      onConfigChange('publishedAt', doc.id);
    }catch(err){
      console.error(err);
      setError(err);
    }finally{
      setLoading(false);
    }
  }

  return (
    <>
      <Text b>{t('LABEL.BEFORE_PUBLISH')}</Text>
      <Text small>{t('MSG.BEFORE_PUBLISH')}</Text>
      <Divider y={1} />
      <Input 
        label={t('LABEL.NAME')}
        initialValue={config?.name}
        onChange={e => onConfigChange('name', e.target.value)}
        />
        
      <Spacer />

      <Input 
        label={t('LABEL.AUTHOR')}
        initialValue={config?.author}
        onChange={e => onConfigChange('author', e.target.value)}
        labelRight={
          <Button auto light 
            onPress={() => onConfigChange('author', author)}
            icon={<User set="broken" />} />
        }
        />
        
      <Spacer />

      <Textarea 
        rows={10}
        label={t('LABEL.DESCRIPTION')}
        placeholder={t('HINT.DESCRIPTION')}
        initialValue={config?.description}
        onChange={e => onConfigChange('description', e.target.value)}
        />

      <Spacer />

      <Row>
        <Switch disabled />
        <Spacer />
        <Text>{t('LABEL.USE_PROXY')}</Text>
      </Row>

      <Spacer />

      <Row>
        <Switch disabled />
        <Spacer />
        <Text>{t('LABEL.USE_CLOUD')}</Text>
      </Row>

      <Spacer />

      <Row>
        <Switch disabled />
        <Spacer />
        <Text>{t('LABEL.USE_WATERMARK')}</Text>
      </Row>

      <Divider y={1} />
      <Button onPress={onPublish}>{t('BTN.PUBLISH')}</Button>

      <Modal blur closeButton autoMargin width="80%" open={showPublish} onClose={() => setShowPublish(false)}>
        <Modal.Header>
          {t('LABEL.PUBLISH_PROGRESS')}
        </Modal.Header>
        <Modal.Body>

          { loading && 
            <Loading size="xl">{t('MSG.PUBLISHING')}</Loading>
          }

          { error &&
            <Text color="error">{error.message}</Text>
          }

          { !loading && config?.publishedAt &&
            <Row>
              <Col css={{textAlign: 'center'}}>
                <Text color="success">{t('MSG.PUBLISHED')}</Text>
              </Col>
            </Row>
          }

        </Modal.Body>
        <Modal.Footer>
          <Button light css={{width: '100%'}} onPress={() => setShowPublish(false)}>{t('BTN.DONE')}</Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}