use serde::Serialize;
use tokio::sync::broadcast;

/// What changed. The clients do not receive the new data on the wire — they
/// receive a nudge and refetch the slice that moved. That keeps the event
/// payload trivial and means a client that reconnects after a gap converges on
/// the truth instead of replaying a log it half-missed.
#[derive(Debug, Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "kebab-case")]
pub enum Topic {
    Plan,
    Recipes,
    Shopping,
    Calendar,
    Tasks,
    Members,
    OutSpots,
}

impl Topic {
    pub fn as_str(self) -> &'static str {
        match self {
            Topic::Plan => "plan",
            Topic::Recipes => "recipes",
            Topic::Shopping => "shopping",
            Topic::Calendar => "calendar",
            Topic::Tasks => "tasks",
            Topic::Members => "members",
            Topic::OutSpots => "out-spots",
        }
    }
}

#[derive(Clone)]
pub struct Bus {
    tx: broadcast::Sender<Topic>,
}

impl Bus {
    pub fn new() -> Self {
        // A generous buffer: the hub and a couple of phones are the only
        // subscribers, and a slow client lagging past this just gets a
        // `Lagged` error, which the SSE handler turns into a full-refresh hint.
        let (tx, _) = broadcast::channel(256);
        Self { tx }
    }

    pub fn publish(&self, topic: Topic) {
        // An error here only means nobody is listening, which is the normal
        // state of a kitchen at 3am.
        let _ = self.tx.send(topic);
    }

    pub fn publish_all(&self, topics: &[Topic]) {
        for topic in topics {
            self.publish(*topic);
        }
    }

    pub fn subscribe(&self) -> broadcast::Receiver<Topic> {
        self.tx.subscribe()
    }
}

impl Default for Bus {
    fn default() -> Self {
        Self::new()
    }
}
