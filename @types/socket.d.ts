type Comment = import('App/Models/Comment').default
type User = import('App/Models/User').default

interface SocketData {
  user: User
}

interface ServerToClientEvents {
  comment_new: (comment: Comment) => void
  comment_update: (comment: Comment) => void
  comment_delete: (commentId: number) => void
  vote_up: (commentId: number) => void
  vote_down: (commentId: number) => void
}

interface ClientToServerEvents {
  discussion_subscribe: (id: number) => void
  discussion_unsubscribe: (id: number) => void
}
