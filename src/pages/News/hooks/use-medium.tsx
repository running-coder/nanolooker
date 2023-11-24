import * as React from "react";

import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";

import { PostSource } from "../";

export enum MEDIUM_FEEDS {
  ANANO_CURRENCY = "@nanocurrency",
  NANO_CURRENCY = "nanocurrency",
  NANOBROWSERQUEST = "@running-coder",
  NANO_CENTER = "the-nano-center",
  NANO_EDUCATION = "nano-education",
  SENATUS = "@senatusspqr",
  JOOHANSSON = "@nanojson",
}

export interface MediumPost {
  author: string;
  source: PostSource.MEDIUM;
  categories: string[];
  description: string;
  content: string;
  descriptionLong: string;
  descriptionShort: string;
  enclosure: any;
  guid: string;
  link: string;
  pubDate: string;
  thumbnail: string;
  title: string;
  feed?: MEDIUM_FEEDS;
}

const AUTHORS: string[] = [];

const removeHtmlTags = (html: string): string => html?.replace(/<[\s\S]+?\/?>/g, "");

const getMediumPosts = async () => {
  const mediumPosts = (await Promise.all(
    Object.values(MEDIUM_FEEDS).map(
      feed =>
        new Promise(async (resolve, reject) => {
          try {
            const res = await fetch(
              `https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/${feed}`,
            );
            const { items } = await res.json();

            const posts: MediumPost[] = items
              .map(({ description, content, author, ...rest }: MediumPost) => {
                if (!description) return false;

                const [, descriptionShort, descriptionLong] =
                  description.match(/(<p>.+?<\/p>)[\s\S]+?(<p>.+?<\/p>)/) || [];

                if (!descriptionShort && !descriptionLong) return false;

                if (!AUTHORS.includes(author)) {
                  AUTHORS.push(author);
                }

                return {
                  ...rest,
                  source: PostSource.MEDIUM,
                  author,
                  descriptionShort: removeHtmlTags(descriptionShort),
                  descriptionLong: removeHtmlTags(descriptionLong),
                  feed,
                };
              })
              .filter(Boolean);

            resolve(posts);
          } catch (err) {
            reject([]);
          }
        }),
    ),
  )) as MediumPost[][];

  const orderedPosts = orderBy(
    mediumPosts.flatMap(x => x),
    ["pubDate"],
    ["desc"],
  );

  const filteredPosts = uniqBy(orderedPosts, "title");

  // @NOTE Add category filtering if needed in the future
  // filteredPosts.filter(({ categories }) => categories.includes("nano"));

  return filteredPosts;
};

const useMedium = () => {
  const [posts, setPosts] = React.useState(Array.from(Array(3).keys()) as unknown as MediumPost[]);
  const [authors, setAuthors] = React.useState(AUTHORS);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    getMediumPosts().then(posts => {
      setPosts(posts);
      setAuthors(AUTHORS);
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading, posts, authors };
};

export default useMedium;
