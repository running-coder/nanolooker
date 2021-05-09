import * as React from "react";
import { rpc } from "api/rpc";
import { isValidAccountAddress } from "components/utils";

interface Params {
  count?: string;
  source?: boolean;
  sorting?: boolean;
  threshold?: string;
  include_only_confirmed?: boolean;
}

interface Response {
  blocks: PendingBlock;
}

export interface PendingBlock {
  amount: string;
  source?: string;
}

export interface Return {
  pending: Response;
  isLoading: boolean;
  isError: boolean;
}

const usePending = (account: string, params: Params): Return => {
  const [pending, setPending] = React.useState({} as any);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const getPending = async (account: string) => {
    setIsError(false);
    setIsLoading(true);

    var pending_blocks = await rpc("pending", {
      account,
      ...params,
    });
	
	if (!pending_blocks.error) {
		var pending_list = Object.keys(pending_blocks.blocks);
		const pending_info = await rpc("blocks_info", {
			hashes: pending_list
		});
		if (pending_info.error) {
			pending_blocks.error = true;
		} else {
			var pending_blocks_info = pending_info.blocks;
			for (var pending_block in pending_blocks_info) {
				var local_timestamp = pending_blocks_info[pending_block].local_timestamp;
				pending_blocks.blocks[pending_block].local_timestamp = local_timestamp;
			}
		}
	}

    !pending_blocks || pending_blocks.error ? setIsError(true) : setPending(pending_blocks);
    setIsLoading(false);
  };

  React.useEffect(() => {
    // Reset on account change
    setPending({});

    if (!isValidAccountAddress(account)) return;

    getPending(account);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  return { pending, isLoading, isError };
};

export default usePending;
