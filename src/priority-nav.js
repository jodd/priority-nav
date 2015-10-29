/* ==========================================================================
   Nav class definition
   ========================================================================== */
import $ from 'jquery';

/* Private
   ========================================================================== */
var defaults = {
    buttonText: 'More',
    postNavId: 'navigation-more'
};

var namespace = 'nav';
var $D = $(document);
var $W = $(window);

/* Public
   ========================================================================== */
export class Nav {

/* constructor -------------------------------------------------------------- */
constructor(element, options) {

    this.options = $.extend({}, defaults, options);

    this.el = element;
    this.$el = $(this.el);
    this.$list = this.$el.find('ul').first();
    this.$items = this.$list.children();
    this.offsets = [];

    // Create extra DOM elements we'll need
    this.$button = $('<button>', {
        'class': 'invisible',
        'html': '<span class="visuallyhidden">' + this.options.buttonText + '</span>',
        'aria-controls': this.options.postNavId,
        'aria-expanded': false
    });

    this.$postNav = $('<ul>', {
        'id': this.options.postNavId,
        'aria-hidden': true
    });

    this.init();
}

/* init --------------------------------------------------------------------- */
init() {

    // Apply styles related to the behavior
    // (unlike CSS ones which are visual)
    this.$list.css('white-space', 'nowrap');

    this.$el.append(this.$button);
    this.$el.append(this.$postNav);

    this.buttonWidth = this.$button.outerWidth();

    // Set button default state
    this.$button
        .removeClass('invisible')
        .attr('aria-hidden', true);

    $D.on('click.' + namespace, function(e) {
        if ($(e.target).closest(this.$button).length) {
            this.onButtonClick();
        } else {
            this.hidePostNav();
        }
    }.bind(this));

    // Get the width of all items
    this.$items.each(function(id, el) {
        this.offsets.push($(el).position().left);
    }.bind(this));

    this.offsets.push(this.$items.last().position().left + this.$items.last().width());

    // Debounce the onResize handler
    var TO;
    $W.on('resize.' + namespace, function() {
        TO && clearTimeout(TO);
        TO = setTimeout(this.onResize.bind(this), 50);
    }.bind(this));

    this.onResize();

}

/* onResize ----------------------------------------------------------------- */
onResize() {

    var threshold = this.$el.width() - this.buttonWidth;
    var $postNavItems = this.$postNav.children();

    // Set the position where to cut the navigation list
    var cut = this.offsets.filter(function(value) {
        return value > threshold;
    }).length;

    // There is one pitfall here when there is enough space to display all items
    // but we have cut > 0 because we subtracted the button width
    cut && (this.offsets[this.offsets.length - 1] <= this.$el.width()) && (cut = 0);

    // Exit if the cut position hasnt changed
    if (cut === $postNavItems.length) return;

    if (cut < $postNavItems.length) {
        this.$list.append($postNavItems.slice(0, $postNavItems.length - cut));
    } else {
        this.$postNav.html(this.$items.slice(this.$items.length - cut));
    }

    this.$button.attr('aria-hidden', !cut);

    !cut && this.hidePostNav();
}

/* onButtonClick ------------------------------------------------------------ */
onButtonClick(e) {
    var isHidden = this.$postNav.attr('aria-hidden') === 'true';

    // Toggle hidden state
    this.$button.attr('aria-expanded', isHidden);
    this.$postNav.attr('aria-hidden', !isHidden);
}

/* hidePostNav -------------------------------------------------------------- */
hidePostNav() {
    this.$button.attr('aria-expanded', false);
    this.$postNav.attr('aria-hidden', true);
}

}
