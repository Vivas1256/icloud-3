import React, { useContext, useEffect, useRef, useState } from "react";
import { Field, Form, Formik } from "formik";
import { head } from "lodash";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import AttachFileIcon from "@material-ui/icons/AttachFile";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import moment from "moment";
import { i18n } from "../../translate/i18n";
import { Box, FormControl, Grid, InputLabel, MenuItem, Select, Tab, Tabs } from "@material-ui/core";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "#fff"
  },
  tabmsg: {
    backgroundColor: theme.palette.campaigntab,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    width: "100%",
  }
}));

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
});

const CampaignModal = ({ open, onClose, campaignId, initialValues, onSave, resetPagination }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const [attachment, setAttachment] = useState(null);
  const [files, setFiles] = useState([]);
  const [campaign, setCampaign] = useState(initialValues || {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    scheduledAt: "",
    status: "Inactiva",
    companyId,
    contactListId: "",
    tagListId: "",
    whatsappId: "",
    fileListId: "",
  });
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [tagLists, setTagLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: contactData } = await api.get(`/contact-lists/list`, { params: { companyId } });
        setContactLists(contactData);

        const { data: whatsappData } = await api.get(`/whatsapp`, { params: { companyId, session: 0 } });
        setWhatsapps(whatsappData);

        const { data: tagData } = await api.get(`/tags`, { params: { companyId } });
        setTagLists(tagData.tags);

        const { data: fileData } = await api.get(`/files`, { params: { companyId } });
        setFiles(fileData);
      } catch (err) {
        toastError(err);
      }
    };

    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (campaignId) {
      const fetchCampaignData = async () => {
        try {
          const { data } = await api.get(`/campaigns/${campaignId}`);
          setCampaign({
            ...data,
            scheduledAt: moment(data.scheduledAt).format("YYYY-MM-DDTHH:mm"),
          });
        } catch (error) {
          console.error("Error fetching campaign data:", error);
          toastError(error);
        }
      };
      fetchCampaignData();
    } else {
      setCampaign(initialValues || {
        name: "",
        message1: "",
        message2: "",
        message3: "",
        message4: "",
        message5: "",
        scheduledAt: "",
        status: "Inactiva",
        companyId,
        contactListId: "",
        tagListId: "",
        whatsappId: "",
        fileListId: "",
      });
    }
  }, [campaignId, open, initialValues]);

  const handleClose = () => {
    onClose();
    setCampaign(initialValues || {
      name: "",
      message1: "",
      message2: "",
      message3: "",
      message4: "",
      message5: "",
      scheduledAt: "",
      status: "Inactiva",
      companyId,
      contactListId: "",
      tagListId: "",
      whatsappId: "",
      fileListId: "",
    });
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const sendMessages = async (campaignId, messages) => {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message) {
        try {
          await api.post(`/campaigns/${campaignId}/send-message`, { message });
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error("Error sending message:", error);
          break;
        }
      }
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const scheduledAt = values.scheduledAt 
          ? moment(values.scheduledAt).add(2, 'hours').format("YYYY-MM-DD HH:mm:ss") 
          : null;

      const dataValues = {
          ...values,
          scheduledAt: scheduledAt,
      };

      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);
        if (attachment) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        await sendMessages(campaignId, [
            values.message1,
            values.message2,
            values.message3,
            values.message4,
            values.message5
        ]);
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);
        if (attachment) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        await sendMessages(data.id, [
            values.message1,
            values.message2,
            values.message3,
            values.message4,
            values.message5
        ]);
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      try {
        await api.delete(`/campaigns/${campaign.id}/media-upload`);
        setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
        toast.success(i18n.t("campaigns.toasts.deleted"));
      } catch (error) {
        console.error("Error deleting media:", error);
        toastError(error);
      }
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {campaignEditable ? (campaignId ? `${i18n.t("campaigns.dialog.update")}` : `${i18n.t("campaigns.dialog.new")}`) : `${i18n.t("campaigns.dialog.readonly")}`}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input type="file" ref={attachmentFile} onChange={handleAttachmentFile} />
        </div>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting }) => (
            <Form>
              <DialogContent dividers>
                <Grid spacing={2} container>
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" margin="dense" fullWidth>
                      <InputLabel id="contactList-selection-label">
                        {i18n.t("campaigns.dialog.form.contactList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.contactList")}
                        labelId="contactList-selection-label"
                        id="contactListId"
                        name="contactListId"
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Ninguno</MenuItem>
                        {contactLists.map(contactList => (
                          <MenuItem key={contactList.id} value={contactList.id}>
                            {contactList.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" margin="dense" fullWidth>
                      <InputLabel id="tagList-selection-label">
                        {i18n.t("campaigns.dialog.form.tagList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.tagList")}
                        labelId="tagList-selection-label"
                        id="tagListId"
                        name="tagListId"
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Ninguno</MenuItem>
                        {tagLists.map(tag => (
                          <MenuItem key={tag.id} value={tag.id}>
                            {tag.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl variant="outlined" margin="dense" fullWidth>
                      <InputLabel id="whatsapp-selection-label">
                        {i18n.t("campaigns.dialog.form.whatsapp")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.whatsapp")}
                        labelId="whatsapp-selection-label"
                        id="whatsappId"
                        name="whatsappId"
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Ninguno</MenuItem>
                        {whatsapps.map(whatsapp => (
                          <MenuItem key={whatsapp.id} value={whatsapp.id}>
                            {whatsapp.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      variant="outlined"
                      margin="dense"
                      type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <FormControl
                      variant="outlined"
                      margin="dense"
                      className={classes.formControl}
                      fullWidth
                    >
                      <InputLabel id="fileList-selection-label">
                        {i18n.t("campaigns.dialog.form.fileList")}
                      </InputLabel>
                      <Field
                        as={Select}
                        label={i18n.t("campaigns.dialog.form.fileList")}
                        name="fileListId"
                        id="fileListId"
                        placeholder={i18n.t("campaigns.dialog.form.fileList")}
                        labelId="fileList-selection-label"
                        disabled={!campaignEditable}
                      >
                        <MenuItem value="">Ninguno</MenuItem>
                        {files.map(file => (
                          <MenuItem key={file.id} value={file.id}>
                            {file.name}
                          </MenuItem>
                        ))}
                      </Field>
                    </FormControl>
                  </Grid>
                  <Grid xs={12} item>
                    <Tabs
                      value={messageTab}
                      indicatorColor="primary"
                      textColor="primary"
                      className={classes.tabmsg}
                      onChange={(e, v) => setMessageTab(v)}
                      variant="fullWidth"
                      centered
                    >
                      <Tab label="Msg. 1" index={0} />
                      <Tab label="Msg. 2" index={1} />
                      <Tab label="Msg. 3" index={2} />
                      <Tab label="Msg. 4" index={3} />
                      <Tab label="Msg. 5" index={4} />
                    </Tabs>
                    <Box style={{ paddingTop: 20 }}>
                      {messageTab === 0 && (
                        <Grid container spacing={2}>
                          <Grid xs={12} md={8} item>
                            <Field
                              as={TextField}
                              name="message1"
                              fullWidth
                              rows={5}
                              label={i18n.t("campaigns.dialog.form.message1")}
                              placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
                              multiline={true}
                              variant="outlined"
                              disabled={!campaignEditable}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {messageTab === 1 && (
                        <Grid container spacing={2}>
                          <Grid xs={12} md={8} item>
                            <Field
                              as={TextField}
                              name="message2"
                              fullWidth
                              rows={5}
                              label={i18n.t("campaigns.dialog.form.message2")}
                              placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
                              multiline={true}
                              variant="outlined"
                              disabled={!campaignEditable}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {messageTab === 2 && (
                        <Grid container spacing={2}>
                          <Grid xs={12} md={8} item>
                            <Field
                              as={TextField}
                              name="message3"
                              fullWidth
                              rows={5}
                              label={i18n.t("campaigns.dialog.form.message3")}
                              placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
                              multiline={true}
                              variant="outlined"
                              disabled={!campaignEditable}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {messageTab === 3 && (
                        <Grid container spacing={2}>
                          <Grid xs={12} md={8} item>
                            <Field
                              as={TextField}
                              name="message4"
                              fullWidth
                              rows={5}
                              label={i18n.t("campaigns.dialog.form.message4")}
                              placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
                              multiline={true}
                              variant="outlined"
                              disabled={!campaignEditable}
                            />
                          </Grid>
                        </Grid>
                      )}
                      {messageTab === 4 && (
                        <Grid container spacing={2}>
                          <Grid xs={12} md={8} item>
                            <Field
                              as={TextField}
                              name="message5"
                              fullWidth
                              rows={5}
                              label={i18n.t("campaigns.dialog.form.message5")}
                              placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
                              multiline={true}
                              variant="outlined"
                              disabled={!campaignEditable}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button 
                  onClick={handleClose} 
                  color="secondary" 
                  disabled={isSubmitting} 
                  variant="outlined"
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>
                {campaignEditable && (
                  <Button 
                    type="submit" 
                    color="primary" 
                    disabled={isSubmitting} 
                    variant="contained" 
                    className={classes.btnWrapper}
                  >
                    {campaignId 
                      ? i18n.t("campaigns.dialog.buttons.edit")
                      : i18n.t("campaigns.dialog.buttons.add")
                    }
                    {isSubmitting && (
                      <CircularProgress size={24} className={classes.buttonProgress} />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

export default CampaignModal;