use std::convert::Infallible;
use std::time::Duration;

use axum::extract::State;
use axum::response::sse::{Event, KeepAlive, Sse};
use futures::Stream;
use tokio::sync::broadcast::error::RecvError;

use crate::state::AppState;

/// The live link between the kitchen display and the phones.
///
/// Events carry a topic name and no data. A client that receives `plan` refetches
/// the plan; that is all. Because nothing is reconstructed from the event
/// sequence, a client that misses events while the iPad's screen is off simply
/// refetches on reconnect and is immediately correct again.
pub async fn subscribe(
    State(state): State<AppState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let mut rx = state.bus.subscribe();

    let stream = async_stream::stream! {
        // Tell a fresh subscriber to load everything, so connecting and
        // refetching are one code path on the client.
        yield Ok(Event::default().event("refresh").data("hello"));

        loop {
            match rx.recv().await {
                Ok(topic) => {
                    yield Ok(Event::default().event(topic.as_str()).data("1"));
                }
                // The client fell far enough behind that events were dropped.
                // Rather than guess what it missed, tell it to reload the lot.
                Err(RecvError::Lagged(skipped)) => {
                    tracing::warn!(skipped, "sse subscriber lagged");
                    yield Ok(Event::default().event("refresh").data("lagged"));
                }
                Err(RecvError::Closed) => break,
            }
        }
    };

    Sse::new(stream).keep_alive(
        // An always-on iPad sitting behind Tailscale will have its connection
        // reaped by any idle timeout in between meals; a comment every 15s
        // keeps it alive without waking anything up.
        KeepAlive::new()
            .interval(Duration::from_secs(15))
            .text("keep-alive"),
    )
}
