import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function PostsIndex() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to '/posts/all' if no 'userId' parameter is present
    if (!router.query.userId) {
      router.push('/posts/all')
    }
  }, [router])

  return <div>Redirecting...</div>
}