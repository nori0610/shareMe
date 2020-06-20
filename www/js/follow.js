// 初期表示処理

document.addEventListener('init', function(event) {
    var page = event.target;
    if (page.id == "follow-list") {
      // if(loginCheck()){
      //   location.href = "main.html";
      // }
      // getFollowerNum();
      if ( jumpUserObjectId == '' ) {
        if ( current_user.follows != undefined ) {
          $('#follow_list_num').html('&nbsp;('+current_user.follows.length+')');
        }
      } else {
        ncmb.User
          .equalTo('objectId', jumpUserObjectId)
          .fetch()
          .then((user) => {
            $('#follow_list_num').html('&nbsp;('+user.follows.length+')');
          });
      }
    }
    if (page.id == "follower-list") {
      if ( jumpUserObjectId == '' ) {
        getFollowerNum();
        $('#follow_list_num').html('&nbsp;('+follower_num+')');
      } else {
        getFollowerNum(jumpUserObjectId);
        $('#follow_list_num').html('&nbsp;('+follower_num+')');
      }
    }
});

// 表示時処理
document.addEventListener('show', function(event) {
  var page = event.target;
  if (page.id == "follow-list") {
    if ( jumpUserObjectId == '' || jumpUserObjectId == current_user.objectId ) {
      dispFollowList();
    } else {
      ncmb.User
        .equalTo('objectId', jumpUserObjectId)
        .fetch()
        .then((user) => {
          dispFollowList(user.follows);
        });

    }
    return;
  }
  if (page.id == "follower-list") {
    if ( jumpUserObjectId == '' || jumpUserObjectId == current_user.objectId ) {
      dispFollowerList();
    } else {
      dispFollowerList(jumpUserObjectId);
    }
    return;
  }
});

const dispFollowerList = (userId="") => {
  let followerUserId = current_user.objectId;
  if ( userId != '' ) {
    followerUserId = userId;
  }
  ncmb.User
    .inArray("follows", [followerUserId])
    .fetchAll()
    .then((follower) => {
      updateFollower(follower);
    });
}

const dispFollowList = (userFollows="") => {
  if ( current_user.follows != undefined || userFollows != '') {
    let userFollowsArray = current_user.follows;
    if ( userFollows != '' ) {
      userFollowsArray = userFollows;
    }
    ncmb.User
    .in("objectId", userFollowsArray)
    .fetchAll()
    .then((follow) => {
      console.log(follow)
      // follow_num = Object.keys(result).length;
      updatefollow(follow);
    });
  }
}

let read_follower_num = 0;
const updateFollower = (follower) => {
  // $('.loading').hide();
  let row = document.querySelector('#follower_list_card');
  let row_image = row.querySelector('.follower_image');
  let row_name = row.querySelector('.follower_name');
  let row_info = row.querySelector('.follower_info');
  let row_id = row.querySelector('.follower_id');
  let row_height = row.querySelector('.follower_height');
  //let row_input = row.querySelector('.follower_input');
  let row_button = row.querySelector('.follow_button_tmp');

  // let col = row.querySelector(".search_thumbnail_card_col");
  let maxnum = Object.keys(follower).length;
  let follower_keys = Object.keys(follower);
//  if(read_follower_num == maxnum){return;}
  read_follower_num = maxnum;
  $('#follower_lists').empty();
  for (let i = 0; i < maxnum; i++) {
    let row_clone = row.cloneNode(false);
    let row_image_clone = row_image.cloneNode(false);
    let row_name_clone = row_name.cloneNode(false);
    let row_info_clone = row_info.cloneNode(false);
    let row_id_clone = row_id.cloneNode(false);
    let row_height_clone = row_height.cloneNode(false);
    //let row_input_clone = row_input.cloneNode(false);
    let row_button_clone = row_button.cloneNode(false);

    //row_input_clone.append(row_button_clone);

    row_clone.classList.add('follower-list-style');
    row_clone.style = '';
    row_clone.id = '';
    // $('#nav')[0].pushPage('user.html', {animation: 'slide', data: {user: photo.user}});
    let current_follower = follower[follower_keys[i]];

    if(current_follower.profileImage==undefined){
      row_image_clone.src = "";
    }else{
      row_image_clone.src = current_follower.profileImage;
    }
    row_clone.append(row_image_clone);

    row_name_clone.innerHTML = current_follower.userName; 
    row_clone.append(row_name_clone);

    row_id_clone.innerHTML = '@' + current_follower.objectId;
    if(current_follower.height==undefined){
      row_height_clone.innerHTML = '  /  -';
    }else{
      row_height_clone.innerHTML = '  /  ' + current_follower.height + 'cm';
    }

    row_info_clone.append(row_id_clone);
    row_info_clone.append(row_height_clone);
    row_clone.append(row_info_clone);

    if ( current_follower.objectId != current_user.objectId ) {
      row_button_clone.classList.add("id_" + current_follower.objectId);
      if ( isFollow(current_follower.objectId) ) {
        row_button_clone.innerHTML = 'フォロー中';
        row_button_clone.classList.remove("follow_button");
        row_button_clone.classList.remove("follow_button_off");
        row_button_clone.classList.add("follow_button_off");
      } else {
        row_button_clone.innerHTML = 'フォローする'
        row_button_clone.classList.remove("follow_button");
        row_button_clone.classList.remove("follow_button_off");
        row_button_clone.classList.add("follow_button");
      }
      let numUpdateFlg = 0;
      // if( jumpUserObjectId == "" || jumpUserObjectId == current_user.objectId ){
      //   numUpdateFlg = 1;
      // }
      row_button_clone.onclick = (function(){ followUpdateOnList(numUpdateFlg, current_follower.objectId); });
      row_clone.append(row_button_clone);
    }

    $('#follower_lists').append(row_clone);

  }
}

let read_follow_num = 0;
const updatefollow = (follow) => {
  // $('.loading').hide();
  let row = document.querySelector('#follow_list_card');
  let row_image = row.querySelector('.follow_image');
  let row_name = row.querySelector('.follow_name');
  let row_info = row.querySelector('.follow_info');
  let row_id = row.querySelector('.follow_id');
  let row_height = row.querySelector('.follow_height');
  //let row_input = row.querySelector('.follow_input');
  let row_button = row.querySelector('.follow_button_tmp');

  // let col = row.querySelector(".search_thumbnail_card_col");
  let maxnum = Object.keys(follow).length;
  let follow_keys = Object.keys(follow);
//  if(read_follow_num == maxnum){return;}
  read_follow_num = maxnum;
  $('#follow_lists').empty();
  for (let i = 0; i < maxnum; i++) {
    let row_clone = row.cloneNode(false);
    let row_image_clone = row_image.cloneNode(false);
    let row_name_clone = row_name.cloneNode(false);
    let row_info_clone = row_info.cloneNode(false);
    let row_id_clone = row_id.cloneNode(false);
    let row_height_clone = row_height.cloneNode(false);
    //let row_input_clone = row_input.cloneNode(false);
    let row_button_clone = row_button.cloneNode(false);

    //row_input_clone.append(row_button_clone);

    row_clone.classList.add('follow-list-style');
    row_clone.style = '';
    row_clone.id = '';
    // $('#nav')[0].pushPage('user.html', {animation: 'slide', data: {user: photo.user}});
    let current_follow = follow[follow_keys[i]];

    if(current_follow.profileImage==undefined){
      row_image_clone.src = "";
    }else{
      row_image_clone.src = current_follow.profileImage;
    }
    row_clone.append(row_image_clone);

    row_name_clone.innerHTML = current_follow.userName; 
    row_clone.append(row_name_clone);

    row_id_clone.innerHTML = '@' + current_follow.objectId;
    if(current_follow.height==undefined){
      row_height_clone.innerHTML = '  /  -';
    }else{
      row_height_clone.innerHTML = '  /  ' + current_follow.height + 'cm';
    }

    row_info_clone.append(row_id_clone);
    row_info_clone.append(row_height_clone);
    row_clone.append(row_info_clone);

    if ( current_follow.objectId != current_user.objectId ) {
      row_button_clone.classList.add("id_" + current_follow.objectId);
      if ( isFollow(current_follow.objectId) ) {
        row_button_clone.innerHTML = 'フォロー中';
        row_button_clone.classList.remove("follow_button");
        row_button_clone.classList.remove("follow_button_off");
        row_button_clone.classList.add("follow_button_off");
      } else {
        row_button_clone.innerHTML = 'フォローする';
        row_button_clone.classList.remove("follow_button");
        row_button_clone.classList.remove("follow_button_off");
        row_button_clone.classList.add("follow_button");
      }
      let numUpdateFlg = 0;
      if( jumpUserObjectId == "" || jumpUserObjectId == current_user.objectId ){
        numUpdateFlg = 1;
      }
      row_button_clone.onclick = (function(){ followUpdateOnList(numUpdateFlg, current_follow.objectId); });
      row_clone.append(row_button_clone);
    }

    $('#follow_lists').append(row_clone);
  }
};

