import React, { PureComponent } from 'react'
import styled from 'styled-components'
import Emojify from 'react-emojione'
import axios from 'axios'
import { FaBolt } from 'react-icons/fa'
import { Router } from '../routes'

import { Web3Store } from '../stores/web3'

const LeaderboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-width: 80vw;
`

const TxGrid = styled.div`
  display: grid;
  grid-template-columns: auto 3fr 1fr 3fr 1fr;
`

const TxLink = styled.a`
  color: #ff9a62;
  text-decoration: none;
`
const TxLinkContainer = styled.div`
  max-width: 200px;
  padding: 0.5rem;
`

const Spannet = styled.span`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
`

const LeaderboardSpannet = styled.span`
  padding: 0.5rem;
`

const LinkSpannet = styled.span`
  padding: 0.5rem 0;
`

const Line = styled.hr`
  margin: 0.5rem 0;
  border-color: rgba(255, 255, 255, 0.1);
`

const Total = styled.h2`
  font-weight: 100;
  padding: 2rem;
  text-align: center;
`

const Amount = styled.span`
  color: #ff9a62;
  font-weight: 400;
  font-size: 3rem;
  padding: 0 2rem;
`

const AmountDonated = props => {
  return (
    <Total>
      Total amount collected
      <Amount>{props.amount} ETH</Amount>
    </Total>
  )
}

export default class Leaderboard extends PureComponent {
  state = {
    txs: [],
    totalAmount: 0,
  }

  fetchTxs = async address => {
    const bs = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}`
    const json = await axios.get(bs)
    return this.processTxList(json.data.result)
  }

  processTxList = ethlist => {
    const { web3 } = Web3Store.get()
    let filteredEthList = ethlist
      .map(obj => {
        obj.value = new web3.utils.BN(obj.value) // convert string to BigNumber
        return obj
      })
      .filter(obj => {
        return obj.value.cmp(new web3.utils.BN(0))
      }) // filter out zero-value transactions
      .reduce((acc, cur) => {
        // group by address and sum tx value
        if (cur.isError !== '0') {
          // tx was not successful - skip it.
          return acc
        }
        if (cur.from === this.props.address) {
          // tx was outgoing - don't add it in
          return acc
        }
        if (typeof acc[cur.from] === 'undefined') {
          acc[cur.from] = {
            from: cur.from,
            value: new web3.utils.BN(0),
            input: cur.input,
            hash: [],
          }
        }
        acc[cur.from].value = cur.value.add(acc[cur.from].value)
        acc[cur.from].input =
          cur.input !== '0x' && cur.input !== '0x00'
            ? web3.utils.hexToAscii(cur.input)
            : acc[cur.from].input
        acc[cur.from].hash.push(cur.hash)
        return acc
      }, {})
    filteredEthList = Object.keys(filteredEthList)
      .map(val => filteredEthList[val])
      .sort((a, b) => {
        // sort greatest to least
        return b.value.cmp(a.value)
      })
      .map((obj, index) => {
        // add rank
        obj.rank = index + 1
        return obj
      })
    const ethTotal = filteredEthList.reduce((acc, cur) => {
      return acc.add(cur.value)
    }, new web3.utils.BN(0))
    filteredEthList = filteredEthList.map(obj => {
      obj.value = parseFloat(web3.utils.fromWei(obj.value)).toFixed(2)
      return obj
    })
    return this.setState({
      txs: filteredEthList,
      totalAmount: parseFloat(web3.utils.fromWei(ethTotal)).toFixed(2),
    })
  }

  componentDidMount = async () => {
    this.fetchTxs(this.props.address)
  }

  render() {
    if (this.state.txs) {
      const TxsList = this.state.txs.map(tx => (
        <React.Fragment key={tx.from}>
          <LeaderboardSpannet>{tx.rank}</LeaderboardSpannet>
          <LeaderboardSpannet>
            <TxLink
              key={tx.from}
              href={`/address/${tx.from}`}
              onClick={() => {
                Router.push(`/address/${tx.from}`)
              }}
            >
              {tx.from}
            </TxLink>
          </LeaderboardSpannet>
          <LeaderboardSpannet>{tx.value} ETH</LeaderboardSpannet>
          <LeaderboardSpannet>
            <Emojify>{tx.input}</Emojify>
          </LeaderboardSpannet>
          <TxLinkContainer>
            {tx.hash.map((hash, index) => (
              <TxLink
                key={hash}
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
              >
                <FaBolt />
              </TxLink>
            ))}
          </TxLinkContainer>
        </React.Fragment>
      ))
      return (
        <LeaderboardContainer>
          <AmountDonated amount={this.state.totalAmount} />
          <TxGrid>
            <Spannet>Rank</Spannet>
            <Spannet>From</Spannet>
            <Spannet>Value</Spannet>
            <Spannet>Message</Spannet>
            <Spannet>Tx</Spannet>
            {TxsList}
          </TxGrid>
        </LeaderboardContainer>
      )
    } else {
      return <div />
    }
  }
}
