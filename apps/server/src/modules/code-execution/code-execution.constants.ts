/**
 * Piston WebSocket error close codes
 * Based on Piston API documentation
 */
export enum PistonErrorCode {
  /** Already Initialized: Sent when a second `init` command is issued */
  ALREADY_INITIALIZED = 4000,

  /** Initialization Timeout: No `init` command was sent within 1 second of connection */
  INIT_TIMEOUT = 4001,

  /** Notified Error: A fatal error occurred, and an `error` packet was transmitted */
  NOTIFIED_ERROR = 4002,

  /** Not yet Initialized: A non-`init` command was sent without a job context */
  NOT_INITIALIZED = 4003,

  /** Can only write to stdin: The client attempted to write to a stream other than stdin */
  INVALID_STREAM = 4004,

  /** Invalid Signal: An invalid signal was sent in a `signal` packet */
  INVALID_SIGNAL = 4005,
}
