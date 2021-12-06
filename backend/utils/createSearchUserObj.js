const createSearchObj = (isFollowingList, searchResultList) => {
  const returnObjectList = searchResultList.map((user) => {
    const userName = user.userName;
    const profilePicture = user.profilePicture;
    const _id = user._id;
    const isFollowing = isFollowingList.some((u) => {
      return u.userId === user._id;
    });

    return {
      _id,
      userName,
      profilePicture,
      isFollowing,
    };
  });
  return returnObjectList;
};

module.exports = { createSearchObj };
