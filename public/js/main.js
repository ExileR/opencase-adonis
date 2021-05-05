var cases = [];
var ws = null;
var csrf_token = $('meta[name="csrf-token"]').attr('content');
$(document).ready(function (e) {
    $('.nav-resize').click(function (e) {
        if ($('.nav').is('.active')) {
            $('.nav').removeClass('active');
        } else {
            $('.nav').addClass('active');
        }
        return false;
    });
    $(document).click(function (e) {
        if ($('.nav').is('.active')) {
            $('.nav').removeClass('active');
        }
    });
    $('[rel=popup]').click(function (e) {
        e.preventDefault();
        showPopup($(this).attr('data-popup'));
        return false;
    });
    $('.close').click(function (e) {
        $('.popup, .overlay, body').removeClass('active');
    });
    $('.overlay').click(function (e) {
        var target = e.target || e.srcElement;
        if (!target.className.search('overlay')) {
            $('.overlay, .popup, body').removeClass('active');
        }
    });

    $('.auth-form .heading').click(function (e) {
        if ($('.auth-form').is('.active')) {
            $('.auth-form').removeClass('active');
        } else {
            $('.auth-form').addClass('active');
        }
    });


    $('.profile-content .btn-accept').click(function (e) {
        if ($('.important-message').is(':hidden')) {
            $('.important-message').slideToggle(500);
            $('.btn-accept').removeClass('active').css('opacity', '1').html('Прочитал');
        } else {
            $('.important-message').slideToggle(500);
            $('.btn-accept').addClass('active').css('opacity', '0.5').html('Прочитать');
            Cookies.set('hide-message', 'true', {expires: 7, path: '/'});
        }

        return false;
    });
    if (Cookies.get('hide-message') == 'true') {
        $('.important-message').hide();
        $('.btn-accept').addClass('active').css('opacity', '0.5').html('Прочитать');
    }
    ;
    var openingCase = false;
    fillCarusel();

    $('body').on('click', ".go-next", function (e) {
        var $popup = $('.popup.popup-winner');
        $popup.find('img').attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
        $('.popup, .overlay, body').removeClass('active');
    });
    $('body').on('click', ".profile-promo button", function (e) {
        var that = $(this);
        $.post('/api/promo', {'_csrf': csrf_token, name: $('.profile-promo input').val()}, function (data) {
            if (data.status == 'success')  updateBalance(data.balance);
            notify(data.msg,data.status);
        });
    });
    $('body').on('click', ".profile-heading .trade-link .btn", function (e) {
        var that = $(this);
        $.post('/api/savelink', {'_csrf': csrf_token, trade_link: $('.profile-heading .trade-link .input').val()}, function (data) {
            notify(data.msg,data.status);
        });
    });
	    $('.faq-item').on('click', ".name", function (e) {
        if ($(this).parent().parent().is('.active')) {
            $(this).parent().parent().removeClass('active');
            $(this).parent().parent().find('.desc').height(0);
        } else {
            $(this).parent().parent().find('.desc').height($(this).parent().parent().find('.desc .text').height());
            $(this).parent().parent().addClass('active');
        }
    });
    $('body').on('click', "#gogame:not(.disabled)", function (e) {
        var that = $(this);
        that.addClass('disabled');
        openingCase = true;
        $.post('/api/open', {'_csrf': csrf_token, 'case': currentCase}, function (data) {
            if (data.status == 'success') {
                $('.popup-winner .name').html(data.market_name);
                $('.popup-winner .image img').attr('src', getImage(data.classid, 295, 162));
                $(".popup-winner .btns a:first-child").text('Продать за ' + data.price + ' Р');
                $(".popup-winner .btns a:first-child").data('order', data.id);
                $(".popup-winner .btns a:first-child").show();
                updateBalance(data.balance);
                $('.roulette .overview').fadeOut(500, function () {
                        fillCarusel();
                        $('.roulette .overview').fadeIn(500, function () {
                            that.text('Открываем...');
                            $(".game .bilet .win").fadeOut(500);
                            $('.popup-winner').removeClass('milspec restricted classified covert common rare white').addClass(data.rar);
                            if (data.rar != 'rare') $('.popup-winner').addClass('white');
                            var name = data.name.split('|');
                            $('.roulette .item:nth-child(22)').removeClass('milspec restricted classified common covert rare').addClass(data.rar);
                            $('.roulette .item:nth-child(22) .name').html(name[0]);
                            $('.roulette .item:nth-child(22) .desc').html(name[1]);
                            $('.roulette .item:nth-child(22)').find('img').attr('src', getImage(data.classid, 100, 100));
                            var _item = $('#casesCarusel > div:nth-child(1)');
                            var _item_width = _item.outerWidth();
                            var _item_wrapper = _item.outerWidth(true);
                            var _marginLeft = _item_wrapper * 21;
                            _marginLeft -= _item_wrapper * 1.45; // изначальная позиция
                            _marginLeft = Math.rand(_marginLeft, _marginLeft + (_item_width - 9.84));
                            var start = parseInt($('#casesCarusel').css('margin-left')),
                                offset = -1 * _marginLeft,
                                position = 0,
                                interval = setInterval(function () {
                                    var offset = parseInt($('#casesCarusel').css('margin-left')) - start,
                                        position_actual = Math.floor(offset / _item_wrapper);

                                    if (position_actual !== position) {
                                        sound('/sounds/case_scroll.wav', 0.2);
                                    }
                                    position = position_actual;
                                }, 10);

                            sound('/sounds/case_open.wav', 0.2);

                            $('#casesCarusel').css('margin-left', '').animate({marginLeft: -1 * _marginLeft}, 6000, 'easeOutQuad', function () {
                                clearInterval(interval);
                                openingCase = false;
                                sound('/sounds/item_reveal.wav', 0.2);
                                that.text('Открыть кейс');
                                that.removeClass('disabled');
                                showPopup('popup-winner');
                            });
                        });
                    }
                );
            }
            else {
                notify(data.msg,data.status);
                openingCase = false;
                that.text('Открыть кейс');
                that.removeClass('disabled');
            }
        })
    })
    ;
    $('body').on('click', ".popup-winner .btns a:first-child, .str .btn-sell", function (e) {
        var that = $(this);
        var order = that.data('order');
        $.post('/api/sell', {'_csrf': csrf_token, 'type': 'sell', order_id: order}, function (data) {
            if (data.status == 'success') {
                updateBalance(data.balance);
                if (!that.hasClass('btn-sell')) {
                    that.data('order', '');
                }
                else that.parent().parent().html('<div class="str" data-title="Продан"> <div class="price">' + parseInt(that.text()) + ' Р</div> </div>');
                $('.popup, .overlay, body').removeClass('active');
                notify(data.msg,data.status);
            } else {
                notify(data.msg,data.status);
            }
        });
    });
	
	$('body').on('click', ".str .btn-resend-item", function (e) {
        var that = $(this);
        var order = that.data('order');
        $.post('/api/send', {'_csrf': csrf_token, 'type': 'send', order_id: order}, function (data) {
            if (data.status == 'success') {
                if (!that.hasClass('btn-resend-item')) {
                    that.data('order', '');
                }
                else that.parent().parent().html('<div class="str" data-title="Отправлен"> <img src="/images/ico-success.png" alt=""> </div>');
                $('.popup, .overlay, body').removeClass('active');
                notify(data.msg,data.status);
            } else {
                notify(data.msg,data.status);
            }
        });
    });

})
;
Array.prototype.shuffle = function () {
    var o = this;
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};
Array.prototype.mul = function (k) {
    var res = []
    for (var i = 0; i < k; ++i)res = res.concat(this.slice(0))
    return res
};
Math.rand = function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
var getImage = function (str, w, h) {
    w = w || 384;
    h = h || 384;
    return '//steamcommunity-a.akamaihd.net/economy/image/class/730/' + str + '/' + w + 'fx' + h + 'f';
}
var sound = function (sound, volume) {
    var audio = new Audio(sound);
    audio.volume = volume;
    audio.play();
};

function showPopup(el) {
    $('.overlay, body, .popup.' + el).addClass('active');
};
function realtime() {
  ws = adonis.Ws('ws://localhost:3333', {path: 'realtime'}).connect()

  ws.on('open', () => {
    console.log('Connection success!')
  })
  
  const live = ws.subscribe('livedrop')
  
  live.on('stats', (data) => {
	$('#games').html(data.games);
    $('#users').html(data.users);
    $('#online').html(data.online);
  })
  
  live.on('drop', (data) => {
    var lastWinners = $('#lastWinners');
    var LastCase = $('#LastCase');
    var LastCase_el = $('  <a href="/user/' + data.userid + '" class="item ' + data.rar + '"> <img src="https://steamcommunity-a.akamaihd.net/economy/image/class/730/' + data.classid + '/190fx120f" alt=""> <div class="caption"> <div class="image"><img src="' + data.images + '" alt=""></div> <div class="name">' + data.name.split('|').slice(0, -1).join(' ') + '</div> <div class="desc">' + data.name.split('|').slice(1).join(' ') + '</div> </div> </a>');
    var lastWinners_el = $('  <a href="/user/' + data.userid + '" class="item ' + data.rar + '"> <img src="https://steamcommunity-a.akamaihd.net/economy/image/class/730/' + data.classid + '/190fx120f" alt=""> <div class="caption"> <div class="image"><img src="' + data.images + '" alt=""></div> <div class="name">' + data.name.split('|').slice(0, -1).join(' ') + '</div> <div class="desc">' + data.name.split('|').slice(1).join(' ') + '</div> </div> </a>');
    setTimeout(function () {
        lastWinners.prepend(lastWinners_el);
        lastWinners.find("a:nth-of-type(25)").remove();
        if (currentCase != undefined && currentCase == data.caseid) {
            LastCase.prepend(LastCase_el);
            LastCase.find("a:nth-of-type(25)").remove();
        }
        lastWinners_el.fadeIn(2000);
        LastCase_el.fadeIn(2000);
    }, '/user/' + data.userid == $('.top-bar .logged .avatar a:first').attr('href') ? 10000 : 0);
  })

  ws.on('error', () => {
    console.log('Connection fail!')
  })
};
var updateBalance = function (data) {
    $('.balance span').text(data + ' Р');
}
var fillCarusel = function () {
    var casesCarusel = $('#casesCarusel');
    var a1 = cases.filter(function (weapon) {
        return weapon[0] == 'milspec'
    }).slice(0).mul(3).shuffle();
    var a6 = cases.filter(function (weapon) {
        return weapon[0] == 'common'
    }).slice(0).mul(3).shuffle();
    var a2 = cases.filter(function (weapon) {
        return weapon[0] == 'restricted'
    }).slice(0).mul(3).shuffle();
    var a3 = cases.filter(function (weapon) {
        return weapon[0] == 'classified'
    }).slice(0).mul(2).shuffle();
    var a4 = cases.filter(function (weapon) {
        return weapon[0] == 'covert'
    }).slice(0).mul(2).shuffle();
    var a5 = cases.filter(function (weapon) {
        return weapon[0] == 'rare'
    }).slice(0).mul(2).shuffle();
    var a7 = cases.filter(function (weapon) {
        return weapon[0] == 'sticker'
    }).slice(0).mul(3).shuffle();
    var arr = a1.concat(a2, a3, a4, a5, a6, a7).shuffle().shuffle().shuffle();
    arr = arr.slice(0, 25);
    var el = '';
    arr.forEach(function (item, i, arr) {
        var name = item[2].split(' | ');
        el += '<div class="item ' + item[0] + '"> <div class="image"><img src="' + getImage(item[1], 125, 125) + '" alt=""></div> <div class="name">' + name[0] + '</div> <div class="desc">' + name[1] + '</div> </div>'
    });
    casesCarusel.css("margin-left", "0px");
    casesCarusel.html(el)
};
var notify = function (text, type) {
    noty({
        text: text,
        type: type,
        theme: 'metroui',
        layout: 'topRight',
        timeout: 4000,
        progressBar: true,
        animation: {
            open: 'animated fadeInDown',
            close: 'animated fadeOutUp'
        }
    });
};