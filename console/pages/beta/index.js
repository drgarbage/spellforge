import { Grid, Card, Text, Link, Button, Container } from "@nextui-org/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson, faPhotoFilm, faPen, faFillDrip, faCarrot, faRulerCombined } from '@fortawesome/free-solid-svg-icons';

const CardButton = ({title, href, image}) => 
  <Card isPressable as={Link} href={href}>
    <Card.Footer css={{justifyContent: 'center', position: 'absolute', bottom:0, backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <Text color="white" weight="bold">{title}</Text>
    </Card.Footer>
  </Card>

export default () => {
  const interfaces = [
    {
      title:"人偶相機",
      href:"/beta/live-figure",
      desc:"電影人偶、公仔拍攝，轉換成栩栩如生的照片。",
      icon: faPerson,
    },
    {
      title:"卡通相機",
      href:"/beta/anime",
      desc:"將照片轉換成卡通動漫風格。",
      icon: faPhotoFilm,
    },
    {
      title:"線稿相機",
      href:"/beta/outline",
      desc:"將照片轉換成線搞。",
      icon: faPen,
    },
    {
      title:"填色相機",
      href:"/beta/painting",
      desc:"將線搞填上顏色，可用於動漫的自動上色。",
      icon: faFillDrip,
    },
    {
      title:"室內設計",
      href:"/beta/interior",
      desc:"拍攝空間並呈現不同風格的裝潢。",
      icon: faRulerCombined,
    },
    {
      title:"商品攝影",
      href:"/beta/product",
      desc:"拍攝商品並放在合適的背景上。",
      icon: faCarrot,
    },
  ];

  return (
    <div style={{
        display:'flex', 
        flexDirection:'row', 
        marginTop: 8, 
        marginLeft: 8,
        justifyContent: 'center',
      }}>
      { interfaces.map(({title, href, desc, icon, image}) => 
        (
          <a 
          key={title}
          href={href}
          style={{
            maxWidth: 128,
            marginRight: 8,
          }}>
            <div 
              style={{
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                border: '1px solid silver',
                borderRadius: 8,
                padding: 8,
              }}>
              <h1><FontAwesomeIcon icon={icon} /></h1>
              <h4>{title}</h4>
            </div>
            <div
              style={{
                padding: 8,
              }}>
              {desc}
            </div>
          </a>
        )
      )}
    </div>
  );
}