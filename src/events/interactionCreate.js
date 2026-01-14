const { 
    Events, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ActionRowBuilder, 
    EmbedBuilder 
} = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
            // --- MANEJO DE COMANDOS ---
            if (interaction.isChatInputCommand()) {
                const command = interaction.client.commands.get(interaction.commandName);
                if (!command) return;

                try { 
                    await command.execute(interaction); 
                } catch (error) { 
                    console.error(error);

                    // Reporte al canal de logs
                    const logChannel = interaction.client.channels.cache.get(process.env.LOG_CHANNEL_ID);
                    if (logChannel) {
                        const errorEmbed = new EmbedBuilder()
                            .setTitle('❌ Error en Comando')
                            .setColor('#ff4757')
                            .addFields(
                                { name: '💻 Comando', value: `\`/${interaction.commandName}\``, inline: true },
                                { name: '👤 Usuario', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                                { name: '📂 Error', value: `\`\`\`js\n${error.message || error}\n\`\`\`` }
                            )
                            .setTimestamp();

                        await logChannel.send({ embeds: [errorEmbed] });
                    }

                    // Respuesta al usuario
                    const replyContent = '❌ Hubo un error al ejecutar este comando.';
                    if (interaction.replied || interaction.deferred) {
                        await interaction.followUp({ content: replyContent, flags: 64 });
                    } else {
                        await interaction.reply({ content: replyContent, flags: 64 });
                    }
                }
            }

        // --- SISTEMA DE AUTOROLES ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'autorole_menu') {
            const selectedRoles = interaction.values; 
            const allAutoroles = [
                '1460373287338246392', '1460373363431047250', 
                '1460373389993709740', '1460373427113300028', 
                '1460373461452063004'
            ];

            try {
                const member = interaction.member;
                const currentRoles = member.roles.cache.map(r => r.id);
                
                const otherRoles = currentRoles.filter(id => !allAutoroles.includes(id));
                
                const finalRoles = [...otherRoles, ...selectedRoles];

                await member.roles.set(finalRoles);

                await interaction.reply({ 
                    content: 'Tus preferencias han sido actualizadas con éxito.', 
                    flags: 64
                });
            } catch (error) {
                console.error('Error en Autoroles:', error);
                await interaction.reply({ 
                    content: 'Error de permisos al actualizar tus roles.', 
                    flags: 64
                });
            }
        }

        // --- SISTEMA DE SOPORTE: ABRIR MODAL ---
        if (interaction.isButton() && interaction.customId === 'open_support_modal') {
            const modal = new ModalBuilder()
                .setCustomId('support_form')
                .setTitle('Formulario de Soporte Técnico');

            const pluginInput = new TextInputBuilder()
                .setCustomId('plugin_name')
                .setLabel("¿Qué plugin presenta el problema?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ej: MaxStaff, ClearLag+...')
                .setRequired(true);

            const issueInput = new TextInputBuilder()
                .setCustomId('issue_description')
                .setLabel("Describe el error o duda")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explica detalladamente qué sucede...')
                .setRequired(true);

            const logsInput = new TextInputBuilder()
                .setCustomId('error_logs')
                .setLabel("Logs de error o Enlaces (Pastebin/Imágenes)")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Pega aquí el enlace a tus logs o capturas de pantalla relevantes...')
                .setRequired(false); 

            modal.addComponents(
                new ActionRowBuilder().addComponents(pluginInput),
                new ActionRowBuilder().addComponents(issueInput),
                new ActionRowBuilder().addComponents(logsInput)
            );

            await interaction.showModal(modal);
        }

        // --- SISTEMA DE SOPORTE: CREAR HILO ---
        if (interaction.isModalSubmit() && interaction.customId === 'support_form') {
            const plugin = interaction.fields.getTextInputValue('plugin_name');
            const description = interaction.fields.getTextInputValue('issue_description');
            const logs = interaction.fields.getTextInputValue('error_logs') || 'No proporcionado';

            const embed = new EmbedBuilder()
                .setTitle(`Reporte de Soporte: ${plugin}`)
                .setColor('#ff4757')
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: '🔌 Plugin', value: `\`${plugin}\``, inline: true },
                    { name: '👤 Usuario', value: `${interaction.user}`, inline: true },
                    { name: '📝 Descripción', value: description },
                    { name: '📊 Logs / Enlaces adicionales', value: logs }
                )
                .setTimestamp()
                .setFooter({ text: 'Zenith Support System' });

            try {
                const thread = await interaction.channel.threads.create({
                    name: `Soporte: ${plugin} - ${interaction.user.username}`,
                    autoArchiveDuration: 1440,
                    reason: `Nuevo ticket de soporte de ${interaction.user.username}`,
                });

                await thread.send({ 
                    content: `Atención <@${interaction.guild.ownerId}>, hay un nuevo reporte de ${interaction.user}.`, 
                    embeds: [embed] 
                });
                
                await thread.members.add(interaction.user.id);

                await interaction.reply({ 
                    content: `✅ Se ha creado tu hilo de soporte: ${thread}\nPor favor, espera a que un administrador o la comunidad te responda allí.`, 
                    flags: 64 
                });
            } catch (error) {
                console.error('Error al crear el hilo:', error);
                await interaction.reply({ content: 'Hubo un error al crear el hilo de soporte.', flags: 64 });
            }
        }


        // --- SISTEMA DE SUGERENCIAS: ---
        if (interaction.isModalSubmit() && interaction.customId === 'suggestion_modal') {
            const plugin = interaction.fields.getTextInputValue('suggest_plugin');
            const description = interaction.fields.getTextInputValue('suggest_description');
            
            const suggestChannel = interaction.client.channels.cache.get(process.env.SUGGESTIONS_CHANNEL_ID);
            if (!suggestChannel) return interaction.reply({ content: '❌ Error: Canal no configurado.', flags: 64 });

            const embed = new EmbedBuilder()
                .setTitle('💡 Nueva Sugerencia de Plugin')
                .setColor('#f1c40f')
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: '🔌 Plugin', value: `\`${plugin}\``, inline: true },
                    { name: '📝 Propuesta', value: description }
                )
                .setFooter({ text: `ID: ${interaction.user.id} | ¡Vota abajo!` })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('vote_up').setLabel('Me gusta').setEmoji('👍').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('vote_down').setLabel('No me gusta').setEmoji('👎').setStyle(ButtonStyle.Danger)
            );

            await suggestChannel.send({ embeds: [embed], components: [row] });
            await interaction.reply({ content: '✅ ¡Tu sugerencia profesional ha sido enviada con éxito!', flags: 64 });
        }

        // --- SISTEMA DE VOTACIÓN: SOLUCIÓN AL ERROR 10062 ---
        if (interaction.isButton() && (interaction.customId === 'vote_up' || interaction.customId === 'vote_down')) {
            try {
                await interaction.deferReply({ ephemeral: true });

                const voteType = interaction.customId === 'vote_up' ? 'positivo' : 'negativo';
                const emoji = interaction.customId === 'vote_up' ? '👍' : '👎';

                // PROXIMA LÓGICA DE BASE DE DATOS PARA REGISTRAR VOTOS
                
                await interaction.editReply({ 
                    content: `${emoji} Has registrado tu voto **${voteType}**. ¡Gracias por tu feedback!` 
                });
            } catch (error) {
                console.error('Error en votación:', error);
            }
        }



    },
};