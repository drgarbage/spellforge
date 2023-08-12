import { handleEvent } from "./handleEvent";

export default (req, res) => {

  if(req.method === 'POST') {
    res.status(200).end();
    req.body.events.forEach(handleEvent);
  } else {
    res.status(500).end();
  }

}