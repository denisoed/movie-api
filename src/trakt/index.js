/* @flow */

import R from 'ramda';

import movieInfoFromRes from './movieInfoFromRes';
import TraktConnector from './connector';
import type {
  TraktApi$MovieStatsResponse,
  TraktApi$MovieSummaryResponse,
} from './types';
import type {TraktConnectorConfig} from './connector';

class Trakt {
  _connector: TraktConnector;

  constructor(config: void | TraktConnectorConfig) {
    this._connector = new TraktConnector(config);
  }

  getSlug = async (query: {
    imdbId?: string,
    tmdbId?: number,
    isTvShow?: boolean,
  }): Promise<?string> => {
    if (query.imdbId) {
      const res = await this._connector.apiGet(`search/imdb/${query.imdbId}`);

      // $FlowFixMe
      return R.path([0, 'movie', 'ids', 'slug'], res);
    } else if (query.tmdbId) {
      const res = await this._connector.apiGet(`search/tmdb/${query.tmdbId}`, {
        type: query.isTvShow ? 'show' : 'movie',
      });

      // $FlowFixMe
      return R.path([0, query.isTvShow ? 'show' : 'movie', 'ids', 'slug'], res);
    }

    throw new Error('Either an IMDB ID or a TMDB ID required in query');
  };

  getMovieInfo = async (slug: string) => {
    const res: ?TraktApi$MovieSummaryResponse = await this._connector.apiGet(
      `movies/${slug}`,
      {extended: 'full'},
    );

    return res ? movieInfoFromRes(res) : null;
  };

  getMovieStats = async (slug: string) => {
    const res: ?TraktApi$MovieStatsResponse = await this._connector.apiGet(
      `movies/${slug}/stats`,
    );

    return res || null;
  };
}

export default Trakt;
