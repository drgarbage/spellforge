import { Card, Col, Text, Loading, Checkbox, Row, Button } from '@nextui-org/react';
import { CardImage } from 'components/card-image';

export const MultiPhotoCard = ({
  carouselRef,
  title, subtitle, loading, images, checked, onToggle, onShare,
  isPressable, isHoverable, isSelectable, 
  onPress,
  cardClass, cardStyle,
  viewport = {},
  actions = [],
  css,
  ...rest
}) => 
  
    <Card 
      variant='flat'
      isPressable={isPressable}
      isHoverable={isHoverable}
      className={cardClass}
      style={cardStyle}
      onPress={onPress}
      css={{...css, justifyItems: 'center'}}
      >

      <Card.Header css={{position: 'absolute', top: 0}}>
        <Col>
          <Text h3 color='white' css={{margin:0}}>{title}</Text>
          <Text  color='white' css={{margin:0}}>{subtitle}</Text>
        </Col>
      </Card.Header>

      { isSelectable && image && 
        <Checkbox 
          checked={checked} 
          onChange={onToggle} 
          aria-label="Select Image"
          css={{
            position: 'absolute', 
            top: 20, 
            right: 20,
          }} />
      }

      { 
        <Row align='center' justify='flex-end' css={{position: 'absolute', top: 10, right: 10}}>
          {actions.map(({icon, onAction}, index) => 
            <Button key={index} auto light icon={icon} onPress={() => onAction()} />
          )}
        </Row>
      }

      <CardImage 
          carouselRef={carouselRef}
          images={images} 
          {...rest}
          />

      { loading &&
        <Card.Body css={{position: 'absolute', top: 'calc((100vh - 100px) * 768 / 1024 * 0.5)'}}>
          <Loading size="xl" color="white" />
        </Card.Body>
      }

    </Card>
  