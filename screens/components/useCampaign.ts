import { View, Text } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import {
  asyncDownload,
  asyncListAllFiles,
  findOrGenerateChannelId,
  getUri,
  registerToDatabase,
} from './helper';

import { gql } from 'graphql-request';
import { gqlclient } from '../gql';
import { isCompositeType } from 'graphql';

export type AssetDto = {
  _id: string;
  assetName: string;
  duration: number;
  fileSize: number;
  fileType: string;
  fileUrl: string;
};

export type CampaignDto = {
  _id: string;
  campaignName: string;
  assets: AssetDto[];
  totalDuration: number;
};

const timer = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

const useCampaign = () => {
  const [currentAssetUrl, setCurrentAssetUrl] = useState<string>('');
  const [campaignList, setCampaignList] = useState<CampaignDto[]>([]);
  const [playedForThisInterval, setPlayedForThisInterval] = useState(false);
  const intervalRef = useRef<any>();
  // const CHANNEL_ID = useChannelId();
  // console.log(CHANNEL_ID);

  const fetchCampaign = async (CHANNEL_ID: string) => {
    console.log('fetching campaigns ..', new Date());

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 5 * 60000);

    const GET_CAMPAIGNS = `
      query {
        getCampaignForChannel(
          args: {
            channelId: "${CHANNEL_ID}"
            startTime: "${startTime}"
            endTime: "${endTime}"
          }
        ) {
          campaignName
          _id
          totalDuration
          assets {
            assetName
            fileUrl
            duration
            _id
            fileType
            fileSize
          }
        }
      }
    `;
    //console.log(GET_CAMPAIGNS);
    const campaignToPlay = await gqlclient.request(GET_CAMPAIGNS);
    await compareAndDownload(campaignToPlay['getCampaignForChannel']);
    setCampaignList(campaignToPlay['getCampaignForChannel']);
    setPlayedForThisInterval(false);
    return campaignToPlay;
  };

  const compareAndDownload = async (campaigns: CampaignDto[]) => {
    for (let i = 0; i < campaignList.length; i++) {
      const campaign = campaignList[i];

      for (let j = 0; j < campaign['assets'].length; j++) {
        const asset = campaign['assets'][j];
        const availableFiles = await asyncListAllFiles();
        const fileFormat = asset['fileType'].split('/')[1];
        const fileName = `${asset['_id']}.${fileFormat}`;
        if (!availableFiles.includes(fileName)) {
          await asyncDownload(asset['fileUrl'], fileName);
        }
      }
    }
  };

  useEffect(() => {
    async function updateAsset() {
      for (let i = 0; i < campaignList.length; i++) {
        const campaign = campaignList[i];

        for (let j = 0; j < campaign['assets'].length; j++) {
          const asset = campaign['assets'][j];
          const availableFiles = await asyncListAllFiles();
          const fileFormat = asset['fileType'].split('/')[1];
          const fileName = `${asset['_id']}.${fileFormat}`;
          //check if asset exists in local. if not put placeholder video.
          if (availableFiles.includes(fileName)) {
            setCurrentAssetUrl(getUri(fileName));
            console.log('Now playing', fileName, ' at ', new Date());
          } else {
            setCurrentAssetUrl(getUri('placeholder.mp4'));
            console.log('Not found, ', fileName, 'Now playing placeholder at ', new Date());
          }

          await timer(asset['duration'] * 1000);
        }
      }
      setCurrentAssetUrl(getUri('placeholder.mp4'));
    }
    try {
      if (playedForThisInterval === false) {
        updateAsset();
        setPlayedForThisInterval(true);
      }
    } catch (err) {
      console.log(err);
    }
  }, [playedForThisInterval]);

  useEffect(() => {
    const exec = async () => {
      const CHANNEL_ID: any = await findOrGenerateChannelId();
      await registerToDatabase();
      fetchCampaign(CHANNEL_ID);

      const fetchCampaignJob = setInterval(() => {
        fetchCampaign(CHANNEL_ID);
      }, 300000);
      intervalRef.current = fetchCampaignJob;
      return () => {
        clearInterval(fetchCampaignJob);
      };
    };
    exec();
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  return { currentAssetUrl, setCurrentAssetUrl };
};

export default useCampaign;
