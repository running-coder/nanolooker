const sortBy = require("lodash/sortBy");
const reverse = require("lodash/reverse");
const { rawToRai } = require("../../utils");

const representativesTransformer = json => {
  json.representatives = reverse(
    sortBy(
      Object.entries(json.representatives).reduce((acc = {}, [account, weight]) => {
        const weightAsNumber = Number(weight) && rawToRai(weight);
        if (weightAsNumber > 1000) {
          acc.push({
            account,
            weight: weightAsNumber,
          });
        }
        return acc;
      }, []),
      ["weight"],
    ),
  );

  return json;
};

exports.transformer = representativesTransformer;
