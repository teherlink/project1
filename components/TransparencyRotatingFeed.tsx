"use client";

import { useEffect, useState } from 'react';

type FeedItem = {
  username: string;
  depositAmount: string;
};

type TransparencyRotatingFeedProps = {
  items?: FeedItem[];
};

const names = ['Ari', 'Mina', 'Sol', 'Jules', 'Es', 'Fr', 'Kai', 'Noa', 'Lex', 'Ivy', 'Rae', 'Nia', 'Zoe', 'Milo'];

function randomName() {
  const first = names[Math.floor(Math.random() * names.length)];
  const second = names[Math.floor(Math.random() * names.length)];
  const formatted = `${first}${second}`;
  return formatted.length > 10 ? formatted.slice(0, 10) : formatted;
}

function randomAmount() {
  const value = Math.floor(Math.random() * 5000) + 20;
  return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskUsername(username: string) {
  const visible = 2;
  const suffix = username.slice(-visible);
  const masked = '*'.repeat(Math.max(0, username.length - visible));
  return `${masked}${suffix}`;
}

function makeRandomFeedItem() {
  return {
    username: randomName(),
    depositAmount: randomAmount(),
  };
}

export default function TransparencyRotatingFeed({ items = [] }: TransparencyRotatingFeedProps) {
  const [entry, setEntry] = useState<FeedItem>(() => makeRandomFeedItem());

  useEffect(() => {
    const pickNext = () => {
      if (items.length > 0) {
        const depositAmount = items[Math.floor(Math.random() * items.length)].depositAmount;
        setEntry({ username: randomName(), depositAmount });
      } else {
        setEntry(makeRandomFeedItem());
      }
    };

    pickNext();
    const interval = window.setInterval(pickNext, 30000);

    return () => window.clearInterval(interval);
  }, [items]);

  const displayName = maskUsername(entry.username);

  return (
    <div className="feed-item rotating">
      <span className="feed-user">{displayName}</span>
      <span className="feed-action">has joined the platform</span>
      <span className="feed-amount">
        {entry.depositAmount !== '0'
          ? `and deposited ${entry.depositAmount}`
          : 'and is ready to deposit'}
      </span>
    </div>
  );
}
