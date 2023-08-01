type Comment = import('App/Models/Comment').default
type User = import('App/Models/User').default

interface SocketData {
  user: User
}

interface ServerToClientEvents {
  discussion_update: (discussionId: number) => void
  comment_new: (comment: Comment) => void
  comment_update: (commentId: number) => void
  comment_delete: (commentId: number) => void
}

interface ClientToServerEvents {
  discussion_subscribe: (id: number) => void
  discussion_unsubscribe: (id: number) => void
}
