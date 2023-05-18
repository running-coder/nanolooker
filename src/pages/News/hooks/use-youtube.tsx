import * as React from "react";

import forEach from "lodash/forEach";

import { PostSource } from "../";

export enum YOUTUBE_CHANNELS {
  JASONESG = "JasonEsg",
  NANO = "Nano",
}

export interface YoutubePost {
  author: string;
  videoId: string;
  source: PostSource.YOUTUBE;
  title: string;
  channelTitle: string;
  description: string;
  pubDate: string;
  thumbnail: string;
  feed: YOUTUBE_CHANNELS;
}

const AUTHORS: string[] = [];

const getYoutubePosts = async (): Promise<YoutubePost[]> =>
  new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(`/api/youtube-playlist`);
      const json = await res.json();

      const posts: YoutubePost[] = [];

      Object.keys(json).forEach(author => {
        forEach(json[author], ({ snippet, id: { videoId = "" } = {} }) => {
          const {
            title,
            channelTitle,
            description,
            publishedAt,
            thumbnails: { high: { url = "" } = {} } = {},
          } = snippet;

          if (!videoId && url) {
            [, videoId] = url.match(/\/vi\/(.+?)\//) || [];
          }

          if (!videoId) {
            return;
          }

          posts.push({
            author: channelTitle,
            videoId,
            source: PostSource.YOUTUBE,
            title,
            channelTitle,
            description,
            pubDate: publishedAt,
            thumbnail: url,
            feed: author as YOUTUBE_CHANNELS,
          });

          if (!AUTHORS.includes(channelTitle)) {
            AUTHORS.push(channelTitle);
          }
        });
      });

      resolve(posts);
    } catch (err) {
      reject([]);
    }
  });

const useYoutube = () => {
  const [posts, setPosts] = React.useState([] as YoutubePost[]);
  const [authors, setAuthors] = React.useState(AUTHORS);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getYoutubePosts().then(posts => {
      setPosts(posts);
      setAuthors(AUTHORS);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading, posts, authors };
};

export default useYoutube;
