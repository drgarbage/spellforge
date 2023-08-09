import { Card, Col, Text, Button } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

import styles from 'styles/Home.module.css';

export const GrimoireCard = ({title, subtitle, onPress, onDelete, image, ...rest}) =>
  <Card
    isPressable
    isHoverable
    variant="flat"
    className={`${styles.cardAnimation} ${styles.cardHover} ${styles.cardNotHover} ${styles.cardStyle}`}
    onClick={e => {e.preventDefault(); onPress();}}
    {...rest}
    >
    <Card.Image 
      src={image || '/images/cardface.png'}
      width="100%"
      height="100%"
      objectFit="cover"
      />
    <Card.Header>
      <Col>
        <Text h6 css={{margin:0, lineHeight: '100%'}}>{title}</Text>
        <Text small css={{lineHeight: '100%'}}>{subtitle}</Text>
      </Col>
      { onDelete && 
        <Button 
          auto light 
          onPress={e => {onDelete()}}
          icon={<FontAwesomeIcon icon={faTrashCan} />} 
          />
      }
    </Card.Header>
  </Card>