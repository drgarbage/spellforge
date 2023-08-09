import { useEffect, useState } from "react";
import { Card, Grid, Text, Col, Row, Button, Badge, Collapse } from "@nextui-org/react";
import { CardImage } from "../../components/card-image";
import { useRouter } from "next/router"
import { documents, documentMatches, update } from "../../libs/api-firebase";

const TAGS = ['nsfw', 'ugly', 'published', 'approved'];

const toggleTag = (post, tag) => {
  if(!post.tags) post.tags = [];
  const tagIndex = post.tags.indexOf(tag);
  if (tagIndex !== -1) {
    post.tags.splice(tagIndex, 1);
  } else {
    post.tags.push(tag);
  }
  return post;
}

const PostCard = ({post, onToggle}) =>
  <Grid xs={12} sm={6} md={4} lg={3}>
    <Card>
      <CardImage images={post.images || [{src: post.image}]} />
      <Card.Body css={{paddingTop: 0, paddingBottom: 0}}>
        <Collapse 
          divider={false}
          style={{ "--nextui-space-lg": 0 }}
          title={post.poster}
          subtitle={
            <Col>
              <Text small>{post.time} {post.weather}</Text>
              <Text>{post.comment}</Text>
            </Col>
          }>
          <Text small color="gray">{post.prompt}</Text>
        </Collapse>
      </Card.Body>
      <Card.Footer>
        <Row justify="flex-end">
          {TAGS.map(tag => 
            <Badge 
              key={tag}
              css={{cursor: 'pointer'}}
              color={!!post.tags && post.tags.indexOf(tag) !== -1 ? "primary" : "default"}
              onClick={() => onToggle(post, tag)}>
                {tag}
            </Badge>
          )}
        </Row>
      </Card.Footer>
    </Card>
  </Grid>


export default () => {
  const router = useRouter();
  const { id: seriesId } = router.query;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  
  const reload = async () => {
    if(!seriesId) return;
    try{
      setError(null);
      setLoading(true);
      const results = seriesId === 'all' ?
        await documents('posts') :
        await documentMatches('posts', { poster: seriesId } );
      setPosts(results);
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const onToggle = async (p, tag) => {
    const nextPost = toggleTag({...p}, tag);
    await update(`posts`, nextPost.id, { tags: nextPost.tags });
    await reload();
  }

  useEffect(() => {reload()}, [seriesId]);

  return (
    <>
      <Grid.Container gap={1}>
        {posts.map(post => 
          <PostCard key={post.id} post={post} onToggle={onToggle} />
        )}
      </Grid.Container>
    </>
  );
}