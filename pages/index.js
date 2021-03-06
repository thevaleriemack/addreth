import React, { Component } from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import parseDomain from 'domain-name-parser'
import { FaGithub } from 'react-icons/fa'

import { Router, Link } from '../routes'

import SearchBar from '../components/SearchBar'
import Button from '../components/Button'

import { Web3Store, initMetaMask } from '../stores/web3'

const { web3 } = Web3Store.get()

const Container = styled.div`
  max-width: 100vw;
  display: grid;
  grid-template-columns: (auto-fit, 1fr);
  background-color: black;

  @media (max-width: 640px) {
    height: 100vh;
    width: 100vw;
  }
`

const Background = styled.div`
  background: linear-gradient(
    to bottom,
    rgba(118, 32, 143, 1) 0%,
    rgba(254, 164, 107, 1) 40%,
    rgba(252, 10, 146, 1) 100%
  );
  background: url('/static/images/bg.jpeg') no-repeat;
  background-size: cover;
  min-height: 120vh;
  max-width: 100vw;
`

const Content = styled.div`
  margin: 0 auto;
  max-width: 920px;
  position: relative;
`

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: (auto-fill, 1fr);
  background-color: black;
  color: white;
  min-height: 30vh;
  align-content: center;
`

const Navigation = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, auto);
  justify-content: center;
  height: 4rem;
`

const NavLink = styled.a`
  text-transform: uppercase;
  font-size: 22px;
  font-weight: 600;
  opacity: 0.7;
  padding: 2rem;
  justify-self: center;
`

const Brand = styled.img`
  padding-top: 3rem;
  width: 100%;
`

const Version = styled.div`
  font-size: 48px;
  opacity: 0.3;
  float: right;
  margin-top: -2rem;
`

const SearchWrapper = styled.div`
  display: grid;
  justify-content: center;
  width: 100%;
  grid-gap: 1rem;
`

const MainSection = styled.div`
  display: grid;
  background-color: rgba(0, 0, 0, 0.8);
  transform: skew(0deg, -10deg);
  grid-template-columns: 1fr 1fr;
  width: 100%;
  position: absolute;
  top: 80vh;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const SubHeadline = styled.h1`
  padding: 1rem;
  color: white;
  font-size: 3rem;
  font-weight: 300;
  text-align: center;
`

const Teaser = styled.p`
  padding: 3rem;
  padding-top: 5rem;
  color: white;
  justify-self: end;
  transform: skew(0deg, 10deg);
`

const TeaserText = styled.img`
  width: 300px;
`

const NetworkId = styled.h1`
  color: #ff9a62;
  text-align: center;
  padding: 2rem;
`

const TextHeadline = styled.h1``

const TextBlock = styled.div`
  display: block;
`

const TextBlockCenter = styled.div`
  display: block;
  text-align: center;
  padding-top: 1.5rem;
`

const Footer = styled.div`
  display: grid;
  min-height: 20vh;
  max-height: 400px;
  background-color: #fc0a92;
  justify-items: center;
  align-items: center;
`

const GithubLink = styled.a`
  color: #000;
  font-size: 3rem;
`

const FooterText = styled.p`
  color: #000;
`

const validateInput = input =>
  web3.utils.isAddress(input) || parseDomain(input).tld === 'eth'

const alerting = () =>
  alert('Please enter a valid ENS name or Ethereum address')

class App extends Component {
  state = {
    inputValue: '',
  }

  componentDidMount() {
    initMetaMask()
  }

  searchHandler = e => {
    const value = e.target.value

    if (validateInput(value)) {
      if (e.keyCode === 13) {
        Router.push(`/address/${value}`)
      }
      this.setState({ inputValue: value })
    } else if (e.keyCode === 13) {
      alerting()
    }
  }

  render() {
    const { inputValue } = this.state
    return (
      <Container>
        <Background>
          <Head>
            <title>AddrETH</title>
          </Head>
          <Content>
            <Navigation>
              <NavLink>Claim</NavLink>
              <NavLink>Search</NavLink>
              <NavLink>Create</NavLink>
            </Navigation>
            <Brand src="static/images/brand.svg" />
            <Version>v0.1</Version>
            <SearchWrapper>
              <SearchBar
                id="search"
                onChange={this.searchHandler}
                onKeyDown={this.searchHandler}
              />
              <Button
                primary
                onClick={() =>
                  validateInput(inputValue)
                    ? Router.push(`/address/${inputValue}`)
                    : alerting()
                }
              >
                Resolve
              </Button>
            </SearchWrapper>
          </Content>
          <MainSection>
            <SubHeadline>"YourSpace" in Ethereum</SubHeadline>

            <Teaser>
              <TeaserText src="static/images/teaser.svg" />
            </Teaser>
          </MainSection>
        </Background>
        <ContentWrapper>
          <Content>
            <TextBlockCenter>
              Please log into Metamask - addreth is set to:{' '}
              <NetworkId>Ethereum Mainnet</NetworkId>
            </TextBlockCenter>
            <TextHeadline>Welcome to AddrETH!</TextHeadline>
            <TextBlock>
              We provide a service that lets you put content to your MetaMask
              enabled Ethereum address, as well as browse the content of others.
            </TextBlock>
            <TextBlock>
              With AddrETH it is easy to mark an address for a specific purpose
              - for this we plan to use modules.
            </TextBlock>
            <TextBlock>Our first module is the beloved:</TextBlock>
            <SubHeadline>Donation Leaderboard</SubHeadline>
          </Content>
          <Footer>
            <GithubLink href={`https://github.com/addreth/addreth`}>
              <FaGithub />
            </GithubLink>
            <FooterText>MMXVIII No Rights Reserved</FooterText>
          </Footer>
        </ContentWrapper>
      </Container>
    )
  }
}

export default App
