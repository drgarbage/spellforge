import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faCommentSms } from "@fortawesome/free-solid-svg-icons";
import { Button, Card, Col, Divider, Dropdown, Grid, Input, Row, Spacer, Text } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { robotVerify, authByPhone } from "libs/api-firebase";
import { useUserContext } from "context";
import { authByGoogle } from "libs/api-firebase";
import { useRouter } from "next/router";
import countryCodesStore from 'country-codes-list';

const countryCodes = countryCodesStore.customList('countryCallingCode', '+{countryCallingCode}: {countryNameEn}');

export default (props) => {
  const router = useRouter();
  const recaptchaContainer = useRef(null);
  const [countryCode, setCountryCode] = useState('886');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [conformation, setconformation] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const { user, setUser } = useUserContext();


  const onRetrieveCode = async () => {
    if(phoneNumber.length === 0) return;
    const conf = await authByPhone(`+${countryCode}${phoneNumber}`);
    alert('認證碼已送出');
    setconformation(conf);
  }

  const onLoginWithPhone = async () => {
    if(!conformation) return;
    const {operationType, providerId, user} = await conformation.confirm(confirmationCode);
    setUser(user);
  }

  const onLoginWithGoogle = async () => {
    const { providerId, user } = await authByGoogle();
    setUser(user);
  }

  useEffect(()=>{
    if(typeof window === 'undefined') return;
    robotVerify(recaptchaContainer.current).catch(console.error);
  }, [typeof window]);

  useEffect(() => {
    if(!user) return;
    router.replace('/');
  }, [user]);

  return (
    <Col>
      <Row className="fill-available" align="center" justify="center">
        <style jsx global>
          {`
            body {
              height: fill-available;
              background-color: #dddddd;
            }
            .fill-available {
              height: fill-available;
            }
          `}
        </style>
        <div ref={recaptchaContainer}></div>
        <Card css={{maxWidth: '300px'}}>
          <Card.Body>
            <Input 
              fullWidth 
              aria-label="Phone Number"
              placeholder="Phone Number" 
              initialValue={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              labelLeft={
                <Dropdown>
                  <Dropdown.Button css={{padding:0}} auto light>{`+${countryCode}`}</Dropdown.Button>
                  <Dropdown.Menu 
                    selectionMode="single"
                    selectedKeys={countryCode}
                    onSelectionChange={([value]) => setCountryCode(value)}
                    css={{maxHeight:300, width: 600}}>
                    { Object.keys(countryCodes).map(key => 
                      <Dropdown.Item key={key}><nobr>{countryCodes[key]}</nobr></Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              }
              />
            <Spacer y={1} />
            <Input
              fullWidth 
              aria-label="Confirmation Code"
              placeholder="Confirmation Code" 
              initialValue={confirmationCode}
              onChange={e => setConfirmationCode(e.target.value)}
              labelRight={<Button auto light css={{padding:0}} onPress={onRetrieveCode}>取得驗證碼</Button>}
              />
            <Spacer y={1} />
            <Button  
              onPress={onLoginWithPhone}
              icon={<FontAwesomeIcon icon={faCommentSms} />}>
              Login by Phone
            </Button>
            <Spacer y={1} />
            <Divider />
            <Spacer y={1} />
            <Button  
              onPress={onLoginWithGoogle}
              icon={<FontAwesomeIcon icon={faGoogle} />}
              css={{backgroundColor: '#DB4437'}}>
              Google
            </Button>
          </Card.Body>
        </Card>
      </Row>
    </Col>
  );
}