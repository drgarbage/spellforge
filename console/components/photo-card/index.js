import { Card, Row, Col, Text, Loading, Checkbox, Button } from '@nextui-org/react';

export const PhotoCard = ({
  title, subtitle, loading, image, checked, onToggle,
  isPressable, isHoverable, isSelectable, 
  onPress,
  cardClass, cardStyle,
  viewport = {},
  actions = []
}) => 
  
    <Card 
      variant='flat'
      isPressable={isPressable}
      isHoverable={isHoverable}
      className={cardClass}
      style={cardStyle}
      onPress={onPress}
      css={{...viewport}}
      >

      <Card.Header css={{position: 'absolute', top: 0}}>
        <Col>
          <Text h3 color='white' css={{margin:0}}>{title}</Text>
          <Text  color='white' css={{margin:0}}>{subtitle}</Text>
        </Col>
      </Card.Header>

      { actions?.length > 0 &&
        <Row align='center' justify='flex-end' css={{position: 'absolute', top: 10, right: 10}}>
          {actions.map(({icon, onAction}, index) => 
            <Button key={index} auto light icon={icon} onPress={() => onAction()} />
          )}
        </Row>
      }
      
      <Card.Image 
        alt={title}
        src={image}
        containerCss={{...viewport, backgroundSize: 'cover'}}
        width={viewport.width}
        height={viewport.height}
        objectFit="cover"
        />
        
      { loading &&
        <Card.Footer css={{position: 'absolute', height: 'stretch', width: 'stretch'}}>
          <Row justify='center'>
          <Loading size="xl" color="white" />
          </Row>
        </Card.Footer>
      }
    </Card>
  