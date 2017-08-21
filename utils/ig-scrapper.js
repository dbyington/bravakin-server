const Nightmare = require('nightmare')

const GOOGLE_API_KEY = process.env.GOOGLE_API_SECRET
const googleMapsClient = require('@google/maps').createClient({
  key: GOOGLE_API_KEY
})

const baseURL = 'https://www.instagram.com'

const iHaveAnAccountButtonSelector = '._b93kq'
const usernameInputSelector = 'input[name="username"]'
const passwordInputSelector = 'input[name="password"]'
const mainFeedSelector = '#mainFeed'
const mainArticleSelector = '._mesn5'
const loginButtonSelector = '._qv64e'
const profileButtonSelector = 'a._8scx2'
const followersLinkSelector = '._t98z6'
const followerLISelector = '._2g7d5'
const closeModalButtonSelector = '._dcj9f'

const numPostsSelector = '._fd86t'
const postLinkSelector = '._mck9w a'
const postLocationSelector = '._q8ysx'
const postHeaderSelector = '._7b8eu'

const tagSearchSelector = '._cmdpi ._mck9w'
const tagSearchLinkSelector = `${tagSearchSelector} a`
const tagSearchImageSelector = `${tagSearchSelector} img`

class InstagramScrapper {
  constructor (username, password, cookies) {
    this.username = username
    this.password = password
    this.cookies = cookies
    this.result = {}
    this.nightmare = Nightmare({ show: true })
    if (cookies) this.nightmare.cookies.set(cookies)
  }

  async scrapeFollowers () {
    try {
      await this._signIn()
      await this._scrapeProfile()

      if (this.result.user && this.result.user.followers > 0) {
        await this._scrapeFollowers()
      }

      return this.result;
    } catch (e) {
      this.end()
      throw e
    }
  }

  async getLikeableMediaFromHashtag (hashtag) {
    if (!hashtag) throw new Error('Hashtag not provided.')
    const url = `${baseURL}/explore/tags/${hashtag}/`
    this.nightmare
      .goto(url)
      .wait(tagSearchSelector)
      .evaluate((tagSearchLinkSelector, tagSearchImageSelector) => {
        let links = document.querySelectorAll(tagSearchLinkSelector);
        links = Array.prototype.slice.call(links, 9);
        let images = document.querySelectorAll(tagSearchImageSelector);
        images = Array.prototype.slice.call(images, 9);
        return images.map((image, index) => {
          const imageURL = image.getAttribute('src')
          return {
            url: links[index].getAttribute('href'),
            imageURL
          }
        })
      }, tagSearchLinkSelector, tagSearchImageSelector)
      .then(result => console.log(result))
      .catch(e => this.nightmare.end())
  }

  async getLikeableMediaFromUsername () {

  }

  end () {
    this.nightmare.end()
  }

  _signIn () {
    this.result.scraped_at = new Date()
    return this.nightmare
      .goto(baseURL)
      .wait(iHaveAnAccountButtonSelector)
      .click(iHaveAnAccountButtonSelector)
      .type(usernameInputSelector, this.username)
      .type(passwordInputSelector, this.password)
      .click(loginButtonSelector)
      .wait(mainFeedSelector)
      .cookies.get()
      .then(cookies => {
        this.result.user = {
          username: this.username
        }
        return cookies
      })
  }

  _scrapeProfile () {
    const url = `${baseURL}/${this.username}/`
    console.log('\tAccessing:', url)
    return this.nightmare
      .goto(url)
      .wait(numPostsSelector)
      .evaluate(numPostsSelector => {
        const nodes = [
          document.querySelectorAll(numPostsSelector)[0].innerHTML,
          document.querySelectorAll(numPostsSelector)[1].innerHTML,
          document.querySelectorAll(numPostsSelector)[2].innerHTML
        ]
        return nodes
      }, numPostsSelector)
      .then(parsed => {
        const [posts, followers, following] = parsed
        Object.assign(this.result.user, {
          posts,
          followers,
          following
        })
      })
  }

  async _scrapeFollowers () {
    const url = `${baseURL}/${this.username}/followers/`;
    console.log('\tAccessing:', url);
    await this.nightmare
      .evaluate(followersLinkSelector => {
        return document.querySelectorAll(followersLinkSelector)[1].click()
      }, followersLinkSelector)
      .wait(followerLISelector)
      .evaluate(followerLISelector => {
        const names = document.querySelectorAll(followerLISelector);
        // TODO: Apply some pagination
        return Array.prototype.map.call(names, name => name.innerHTML)
      }, followerLISelector)
      .then(parsed => {
        Object.assign(this.result.user, {
          followers: parsed
        })
      })

    // Add geolocation
    for (let i = 0; i < this.result.user.followers.length; i++) {
      const follower = this.result.user.followers[i];
      const url = `${baseURL}/${follower}/`
      // const url = `${baseURL}/casvil/`
      await this.nightmare
        .goto(url)
        .wait(mainArticleSelector)
        .click(postLinkSelector)
        .wait(postHeaderSelector)
        .evaluate(postLocationSelector => {
          const locationNode = document.querySelector(postLocationSelector);
          return locationNode
            ? locationNode.innerHTML
            : null;
        }, postLocationSelector)
        .then(location => {
          if (location) {
            this._evalLocation(location)
              .then(response => {
                this.result.user.followers[i] = {
                  username: this.result.user.followers[i],
                  location: Object.assign(
                    response.json.results[0].geometry.location,
                    { name: location }
                  )
                }
              })
          } else throw new Error('No location provided');
        })
        .catch(e => {
          this.result.user.followers[i] = {
            username: this.result.user.followers[i],
            location: null
          }
        })
    }
  }

  _evalLocation (location) {
    return new Promise((resolve, reject) => {
      googleMapsClient.geocode({ address: location }, (err, response) => {
        if (err) reject(err);
        else resolve(response);
      });
    })
  }
}

(new InstagramScrapper()).getLikeableMediaFromHashtag('goldenhour')

module.exports = InstagramScrapper
