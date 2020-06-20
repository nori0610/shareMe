
const applicationKey = '0e1c91f00a4a1eb4ef8be149894e764a26fc59695dbf46e9dfea003af1142953';
const clientKey = '8a704d87445cc75c1e7f08bc3d3bea6a9092ca075260579d6022669b5ed762ed';
const applicationId = 'WDavdDyjZqbhBepG';





const ncmb = new NCMB(applicationKey, clientKey);
let current_user = ncmb.User.getCurrentUser();

const noProfileImage = 'img/user.png';
const noProfileName  = 'No name';

/* 共通変数 */
let follower_num = 0;
let jumpUserObjectId = '';
let sumTimelinePhotos = {};

let timelineDisp = 0;

const createAlertDialog = (id) => {
  var dialog = document.getElementById(id);
  if (dialog) {
    dialog.show();
  } else {
    ons.createElement(id + '.html', { append: true })
      .then(function(dialog) {
        dialog.show();
      });
  }
};

const hideAlertDialog = (id) => {
  document
    .getElementById(id)
    .hide();

  if( id == 'camera-notice1' ){
    $(".tabbar__button:eq(2)").click();
  }
};

// 画像系
const loadExif = (img) => {
  return new Promise((res, rej) => {
    EXIF.getData(img, function() {
      const lat = EXIF.getTag(this, "GPSLatitude");
      const long = EXIF.getTag(this, "GPSLongitude");
      const orientation = EXIF.getTag(this, "Orientation");
      res({
        lat: lat,
        long: long,
        orientation: orientation
      });
    });
  })
}

const drawImage = (img, orientation, canvasId) => {
  const canvas = $(canvasId)[0];
  const ctx = canvas.getContext('2d');
  const size = 320;
  const offset = {width: 0, height: 0};
  let rotate = 0;
  let width = height  = size;
  canvas.width = canvas.height = size;
  let originalWidth = img.width;
  let originalHeight = img.height;
  switch (orientation) {
    case 2:
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
    default:
      break;
  }
  if (originalWidth > originalHeight) {
    // 横長
    width =  320 * originalWidth / originalHeight;
    offset.width = -1 * (width - size) / 2;
  }
  if (originalWidth < originalHeight) {
    // 縦長
    height =  320 * originalHeight / originalWidth;
    offset.height = -1 * (height - size) / 2;
  }
  ctx.drawImage(img, offset.width, offset.height, width, height);
};

const fileUpload = (fileName, file) => {
  return new Promise((res, rej) => {
    ncmb.File
      .upload(fileName, file)
      .then((f) => {
        res(filePath(f.fileName));
      })
      .catch((err) => {
        rej(err);
      })
  });
};

const filePath = (fileName) => {
  return `https://mbaas.api.nifcloud.com/2013-09-01/applications/${applicationId}/publicFiles/${fileName}`;
};

const getFollowerNum = (id="") => {
  let searchId = current_user.objectId;
  if(id!=""){
    searchId = id;
  }
  ncmb.User
    .inArray("follows", [searchId])
    .fetchAll()
    .then((result) => {
      follower_num = Object.keys(result).length;
    });
}

const isFollow = (userId) => {
  return current_user.follows && current_user.follows.indexOf(userId) > -1
}

const followUpdateOnList = (numUpdateFlg, userId) => {
  let follows = current_user.follows;
  if (!follows) {
    // まだデータがない場合は初期化
    follows = [userId];
  } else {
    // すでにフォローしているかチェック
    if (follows.indexOf(userId) > -1) {
      // フォローしていればアンフォロー
      follows = follows.filter((u) => {
        return (u !== userId);
      });
      if(numUpdateFlg==1){
        $('#follow_list_num').html('&nbsp;('+(Number($('#follow_list_num').text().replace(/[^0-9]/g, '')) - 1)+')');
      }
    } else {
      // フォローしていなければフォロー
      follows.push(userId);
      if(numUpdateFlg==1){
        $('#follow_list_num').html('&nbsp;('+(Number($('#follow_list_num').text().replace(/[^0-9]/g, '')) + 1)+')');
      }
    }
  }
  current_user
    .set('follows', follows)
    .set('authData', {})  // ないとエラーになります
    .update()
    .then(() => {
      // フォロー状態をチェックしてボタンの文字を変更
      if (isFollow(userId)) {
        $('.id_' + userId).text('フォロー中');
        $('.id_' + userId).removeClass('follow_button').removeClass('follow_button_off').addClass('follow_button_off');
      } else {
        $('.id_' + userId).text('フォローする');
        $('.id_' + userId).removeClass('follow_button').removeClass('follow_button_off').addClass('follow_button');
      }
  })
};
